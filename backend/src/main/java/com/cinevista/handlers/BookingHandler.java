package com.cinevista.handlers;

import com.cinevista.config.DatabaseConfig;
import com.cinevista.models.Booking;
import com.cinevista.models.BookingRequest;
import com.cinevista.models.Seat;
import com.cinevista.utils.JsonUtil;
import com.cinevista.utils.QrCodeUtil;
import com.cinevista.utils.ResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.*;
import java.util.*;

/**
 * Handles ticket booking endpoints:
 * POST /api/bookings        - Atomically book seats for a show (prevents double bookings)
 * GET /api/bookings         - List all bookings (or filter by ?userId=...)
 * GET /api/bookings/{ticketId} - Retrieve specific booking by ticket code
 */
public class BookingHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if ("POST".equalsIgnoreCase(method)) {
            handleCreateBooking(exchange);
        } else if ("GET".equalsIgnoreCase(method)) {
            String ticketId = ResponseUtil.extractPathParam(path, "/api/bookings/");
            if (ticketId != null && !ticketId.isEmpty()) {
                handleGetBookingByTicketId(exchange, ticketId);
            } else {
                handleGetAllBookings(exchange);
            }
        } else {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleCreateBooking(HttpExchange exchange) throws IOException {
        String body = ResponseUtil.readRequestBody(exchange);
        BookingRequest req;
        try {
            req = JsonUtil.fromJson(body, BookingRequest.class);
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, "Invalid JSON payload");
            return;
        }

        if (req == null || req.getShowId() <= 0 || req.getSeats() == null || req.getSeats().isEmpty()) {
            ResponseUtil.sendError(exchange, 400, "Missing showId or seats array");
            return;
        }

        if (req.getSeats().size() > 6) {
            ResponseUtil.sendError(exchange, 400, "Cannot book more than 6 seats per transaction");
            return;
        }

        // Validate seat label formats: row A-J, number 1-12
        for (String seat : req.getSeats()) {
            if (!seat.matches("^[A-J]([1-9]|1[0-2])$")) {
                ResponseUtil.sendError(exchange, 400, "Invalid seat label: " + seat);
                return;
            }
        }

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false); // Begin atomic transaction

            // 1. Fetch show and verify existence
            String showSql = "SELECT s.id, s.movie_id, s.theatre_id, s.show_date, s.show_time, " +
                             "m.title AS movie_title, t.name AS theatre_name " +
                             "FROM shows s " +
                             "JOIN movies m ON s.movie_id = m.id " +
                             "JOIN theatres t ON s.theatre_id = t.id " +
                             "WHERE s.id = ?";

            String movieTitle = null;
            String theatreName = null;
            String showDate = null;
            String showTime = null;

            try (PreparedStatement stmt = conn.prepareStatement(showSql)) {
                stmt.setInt(1, req.getShowId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        movieTitle = rs.getString("movie_title");
                        theatreName = rs.getString("theatre_name");
                        showDate = rs.getString("show_date");
                        showTime = rs.getString("show_time");
                    } else {
                        conn.rollback();
                        ResponseUtil.sendError(exchange, 404, "Show not found");
                        return;
                    }
                }
            }

            // 2. Pre-check if any requested seats are already booked
            StringBuilder checkSql = new StringBuilder("SELECT seat_label FROM booking_seats WHERE show_id = ? AND seat_label IN (");
            for (int i = 0; i < req.getSeats().size(); i++) {
                checkSql.append(i == 0 ? "?" : ", ?");
            }
            checkSql.append(") FOR UPDATE");

            try (PreparedStatement stmt = conn.prepareStatement(checkSql.toString())) {
                stmt.setInt(1, req.getShowId());
                for (int i = 0; i < req.getSeats().size(); i++) {
                    stmt.setString(i + 2, req.getSeats().get(i));
                }
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        String conflictSeat = rs.getString("seat_label");
                        conn.rollback();
                        ResponseUtil.sendError(exchange, 409, "Conflict: Seat " + conflictSeat + " is already booked");
                        return;
                    }
                }
            }

            // 3. Calculate total price and categories
            double totalAmount = 0.0;
            List<SeatInfo> seatInfos = new ArrayList<>();
            for (String seatLabel : req.getSeats()) {
                char rowChar = seatLabel.charAt(0);
                int seatNum = Integer.parseInt(seatLabel.substring(1));
                String category = Seat.categoryForRow(rowChar);
                double price = Seat.priceForCategory(category);
                totalAmount += price;
                seatInfos.add(new SeatInfo(seatLabel, category, price));
            }

            // 4. Generate unique ticket ID and QR code
            String ticketId = "CV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String qrCodeDataUri = QrCodeUtil.generateQrDataUri(ticketId);

            // 5. Insert header booking record
            String insertBookingSql = "INSERT INTO bookings (user_id, show_id, ticket_id, total_amount, status) " +
                                      "VALUES (NULL, ?, ?, ?, 'confirmed') RETURNING id, created_at";

            int bookingId = -1;
            String createdAt = null;
            try (PreparedStatement stmt = conn.prepareStatement(insertBookingSql)) {
                stmt.setInt(1, req.getShowId());
                stmt.setString(2, ticketId);
                stmt.setDouble(3, totalAmount);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        bookingId = rs.getInt("id");
                        createdAt = rs.getString("created_at");
                    }
                }
            }

            // 6. Insert individual seat records (protected by UNIQUE (show_id, seat_label) constraint)
            String insertSeatSql = "INSERT INTO booking_seats (booking_id, show_id, seat_label, category, price) " +
                                   "VALUES (?, ?, ?, ?, ?)";

            try (PreparedStatement stmt = conn.prepareStatement(insertSeatSql)) {
                for (SeatInfo s : seatInfos) {
                    stmt.setInt(1, bookingId);
                    stmt.setInt(2, req.getShowId());
                    stmt.setString(3, s.label);
                    stmt.setString(4, s.category);
                    stmt.setDouble(5, s.price);
                    stmt.addBatch();
                }
                stmt.executeBatch();
            }

            // Commit atomic transaction
            conn.commit();

            // Prepare response object
            Booking res = new Booking();
            res.setBookingId(bookingId);
            res.setTicketId(ticketId);
            res.setShowId(req.getShowId());
            res.setTotalAmount(totalAmount);
            res.setStatus("confirmed");
            res.setCreatedAt(createdAt);
            res.setQrCode(qrCodeDataUri);
            res.setMovieTitle(movieTitle);
            res.setTheatreName(theatreName);
            res.setShowDate(showDate);
            res.setShowTime(showTime);
            res.setSeats(req.getSeats());

            ResponseUtil.sendJson(exchange, 201, res);

        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            // Check for Postgres unique constraint violation error code 23505
            if ("23505".equals(e.getSQLState())) {
                System.err.println("[BookingHandler] Concurrent double booking prevented: " + e.getMessage());
                ResponseUtil.sendError(exchange, 409, "Conflict: One or more selected seats were just taken by another customer");
            } else {
                System.err.println("[BookingHandler] SQL error during booking: " + e.getMessage());
                ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
            }
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (SQLException ignored) {}
            }
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetAllBookings(HttpExchange exchange) throws IOException {
        String sql = "SELECT b.id, b.ticket_id, b.show_id, b.user_id, b.total_amount, b.status, b.created_at, " +
                     "m.title AS movie_title, t.name AS theatre_name, s.show_date, s.show_time, " +
                     "string_agg(bs.seat_label, ', ' ORDER BY bs.seat_label) AS seat_labels " +
                     "FROM bookings b " +
                     "JOIN shows s ON b.show_id = s.id " +
                     "JOIN movies m ON s.movie_id = m.id " +
                     "JOIN theatres t ON s.theatre_id = t.id " +
                     "LEFT JOIN booking_seats bs ON b.id = bs.booking_id " +
                     "GROUP BY b.id, b.ticket_id, b.show_id, b.user_id, b.total_amount, b.status, b.created_at, " +
                     "m.title, t.name, s.show_date, s.show_time " +
                     "ORDER BY b.created_at DESC";

        List<Booking> bookings = new ArrayList<>();
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Booking b = new Booking();
                    b.setBookingId(rs.getInt("id"));
                    b.setTicketId(rs.getString("ticket_id"));
                    b.setShowId(rs.getInt("show_id"));
                    b.setTotalAmount(rs.getDouble("total_amount"));
                    b.setStatus(rs.getString("status"));
                    b.setCreatedAt(rs.getString("created_at"));
                    b.setMovieTitle(rs.getString("movie_title"));
                    b.setTheatreName(rs.getString("theatre_name"));
                    b.setShowDate(rs.getString("show_date"));
                    b.setShowTime(rs.getString("show_time"));

                    String seatsStr = rs.getString("seat_labels");
                    if (seatsStr != null && !seatsStr.isEmpty()) {
                        b.setSeats(Arrays.asList(seatsStr.split(", ")));
                    } else {
                        b.setSeats(Collections.emptyList());
                    }
                    b.setQrCode(QrCodeUtil.generateQrDataUri(b.getTicketId()));
                    bookings.add(b);
                }
            }
            ResponseUtil.sendJson(exchange, 200, bookings);
        } catch (SQLException e) {
            System.err.println("[BookingHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetBookingByTicketId(HttpExchange exchange, String ticketId) throws IOException {
        String sql = "SELECT b.id, b.ticket_id, b.show_id, b.user_id, b.total_amount, b.status, b.created_at, " +
                     "m.title AS movie_title, t.name AS theatre_name, s.show_date, s.show_time, " +
                     "string_agg(bs.seat_label, ', ' ORDER BY bs.seat_label) AS seat_labels " +
                     "FROM bookings b " +
                     "JOIN shows s ON b.show_id = s.id " +
                     "JOIN movies m ON s.movie_id = m.id " +
                     "JOIN theatres t ON s.theatre_id = t.id " +
                     "LEFT JOIN booking_seats bs ON b.id = bs.booking_id " +
                     "WHERE b.ticket_id = ? " +
                     "GROUP BY b.id, b.ticket_id, b.show_id, b.user_id, b.total_amount, b.status, b.created_at, " +
                     "m.title, t.name, s.show_date, s.show_time";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, ticketId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Booking b = new Booking();
                        b.setBookingId(rs.getInt("id"));
                        b.setTicketId(rs.getString("ticket_id"));
                        b.setShowId(rs.getInt("show_id"));
                        b.setTotalAmount(rs.getDouble("total_amount"));
                        b.setStatus(rs.getString("status"));
                        b.setCreatedAt(rs.getString("created_at"));
                        b.setMovieTitle(rs.getString("movie_title"));
                        b.setTheatreName(rs.getString("theatre_name"));
                        b.setShowDate(rs.getString("show_date"));
                        b.setShowTime(rs.getString("show_time"));

                        String seatsStr = rs.getString("seat_labels");
                        if (seatsStr != null && !seatsStr.isEmpty()) {
                            b.setSeats(Arrays.asList(seatsStr.split(", ")));
                        } else {
                            b.setSeats(Collections.emptyList());
                        }
                        b.setQrCode(QrCodeUtil.generateQrDataUri(b.getTicketId()));
                        ResponseUtil.sendJson(exchange, 200, b);
                    } else {
                        ResponseUtil.sendError(exchange, 404, "Booking not found");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[BookingHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private static class SeatInfo {
        final String label;
        final String category;
        final double price;

        SeatInfo(String label, String category, double price) {
            this.label = label;
            this.category = category;
            this.price = price;
        }
    }
}

