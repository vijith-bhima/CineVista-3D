package com.cinevista.handlers;

import com.cinevista.config.DatabaseConfig;
import com.cinevista.models.Seat;
import com.cinevista.models.Show;
import com.cinevista.utils.ResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * Handles show-related endpoints:
 * GET /api/shows?movieId=...&date=...&theatreId=...
 * GET /api/shows/{id}
 * GET /api/shows/{id}/seats
 * GET /api/shows/{id}/best?qty=...
 */
public class ShowHandler implements HttpHandler {

    private static final char[] ROWS = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'};
    private static final int SEATS_PER_ROW = 26;

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if (!"GET".equalsIgnoreCase(method)) {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
            return;
        }

        // Sub-routes: /api/shows/{id}/seats, /api/shows/{id}/best, /api/shows/{id}, /api/shows
        if (path.matches("^/api/shows/\\d+/seats/?$")) {
            int showId = extractIdFromPath(path, 3);
            handleGetSeats(exchange, showId);
        } else if (path.matches("^/api/shows/\\d+/best/?$")) {
            int showId = extractIdFromPath(path, 3);
            handleGetBestSeats(exchange, showId);
        } else if (path.matches("^/api/shows/\\d+/?$")) {
            int showId = extractIdFromPath(path, 3);
            handleGetShowById(exchange, showId);
        } else {
            handleGetShows(exchange);
        }
    }

    private int extractIdFromPath(String path, int segmentIndex) {
        String[] parts = path.split("/");
        return Integer.parseInt(parts[segmentIndex]);
    }

    private void handleGetShows(HttpExchange exchange) throws IOException {
        Map<String, String> query = ResponseUtil.parseQuery(exchange.getRequestURI().getQuery());
        String movieIdStr = query.get("movieId");
        String dateStr = query.get("date");
        String theatreIdStr = query.get("theatreId");

        StringBuilder sql = new StringBuilder(
                "SELECT s.id, s.movie_id, s.theatre_id, s.show_date, s.show_time, " +
                "m.title AS movie_title, t.name AS theatre_name " +
                "FROM shows s " +
                "JOIN movies m ON s.movie_id = m.id " +
                "JOIN theatres t ON s.theatre_id = t.id " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        if (movieIdStr != null && !movieIdStr.isEmpty()) {
            sql.append("AND s.movie_id = ? ");
            params.add(Integer.parseInt(movieIdStr));
        }
        if (dateStr != null && !dateStr.isEmpty()) {
            sql.append("AND s.show_date = ?::DATE ");
            params.add(dateStr);
        }
        if (theatreIdStr != null && !theatreIdStr.isEmpty()) {
            sql.append("AND s.theatre_id = ? ");
            params.add(Integer.parseInt(theatreIdStr));
        }
        sql.append("ORDER BY s.show_date ASC, s.show_time ASC");

        List<Show> shows = new ArrayList<>();
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
                for (int i = 0; i < params.size(); i++) {
                    stmt.setObject(i + 1, params.get(i));
                }
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        shows.add(mapShow(rs));
                    }
                }
            }
            ResponseUtil.sendJson(exchange, 200, shows);
        } catch (SQLException e) {
            System.err.println("[ShowHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetShowById(HttpExchange exchange, int showId) throws IOException {
        String sql = "SELECT s.id, s.movie_id, s.theatre_id, s.show_date, s.show_time, " +
                     "m.title AS movie_title, t.name AS theatre_name " +
                     "FROM shows s " +
                     "JOIN movies m ON s.movie_id = m.id " +
                     "JOIN theatres t ON s.theatre_id = t.id " +
                     "WHERE s.id = ?";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, showId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        ResponseUtil.sendJson(exchange, 200, mapShow(rs));
                    } else {
                        ResponseUtil.sendError(exchange, 404, "Show not found");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ShowHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetSeats(HttpExchange exchange, int showId) throws IOException {
        // Fetch sold seats for this show
        Set<String> soldSeats = getSoldSeatsForShow(showId);
        if (soldSeats == null) {
            ResponseUtil.sendError(exchange, 500, "Failed to load seat availability");
            return;
        }

        List<Seat> seats = new ArrayList<>(120);
        for (char row : ROWS) {
            String category = Seat.categoryForRow(row);
            double price = Seat.priceForCategory(category);
            for (int num = 1; num <= SEATS_PER_ROW; num++) {
                String label = "" + row + num;
                String status = soldSeats.contains(label) ? "sold" : "available";
                seats.add(new Seat(label, String.valueOf(row), num, category, price, status));
            }
        }

        ResponseUtil.sendJson(exchange, 200, seats);
    }

    private void handleGetBestSeats(HttpExchange exchange, int showId) throws IOException {
        Map<String, String> query = ResponseUtil.parseQuery(exchange.getRequestURI().getQuery());
        int qty = 2;
        try {
            if (query.containsKey("qty")) {
                qty = Integer.parseInt(query.get("qty"));
            }
        } catch (NumberFormatException ignored) {}

        if (qty < 1 || qty > 6) {
            ResponseUtil.sendError(exchange, 400, "Quantity must be between 1 and 6");
            return;
        }

        Set<String> soldSeats = getSoldSeatsForShow(showId);
        if (soldSeats == null) {
            ResponseUtil.sendError(exchange, 500, "Failed to query seat availability");
            return;
        }

        // Rank rows: Prime viewing rows are E, F, G, D, H, C, I, J, B, A
        char[] rowPreference = {'F', 'E', 'G', 'D', 'H', 'C', 'I', 'J', 'B', 'A'};

        // Blocks: Left (1..6) and Right (7..12). Never cross the aisle (6 to 7).
        int[][] blocks = {
            {1, 6},
            {7, 12}
        };

        List<String> bestSeats = null;
        double bestScore = Double.MAX_VALUE;

        for (int rIdx = 0; rIdx < rowPreference.length; rIdx++) {
            char row = rowPreference[rIdx];
            for (int[] block : blocks) {
                int blockStart = block[0];
                int blockEnd = block[1];

                // Check each contiguous window of size qty within this block
                for (int startNum = blockStart; startNum <= blockEnd - qty + 1; startNum++) {
                    boolean allAvailable = true;
                    List<String> candidate = new ArrayList<>();
                    double colCenterDist = 0;

                    for (int i = 0; i < qty; i++) {
                        int num = startNum + i;
                        String label = "" + row + num;
                        if (soldSeats.contains(label)) {
                            allAvailable = false;
                            break;
                        }
                        candidate.add(label);
                        // Distance from central aisle (center is 6.5)
                        colCenterDist += Math.abs(num - 6.5);
                    }

                    if (allAvailable) {
                        colCenterDist /= qty;
                        // Score: row priority weight + column center distance
                        double score = (rIdx * 10.0) + colCenterDist;
                        if (score < bestScore) {
                            bestScore = score;
                            bestSeats = candidate;
                        }
                    }
                }
            }
            // If we found a great candidate in a top-tier row, we can stop early
            if (bestSeats != null && rIdx <= 2) {
                break;
            }
        }

        if (bestSeats == null) {
            ResponseUtil.sendError(exchange, 404, "No " + qty + " adjacent seats available");
            return;
        }

        ResponseUtil.sendJson(exchange, 200, bestSeats);
    }

    private Set<String> getSoldSeatsForShow(int showId) {
        String sql = "SELECT seat_label FROM booking_seats WHERE show_id = ?";
        Set<String> sold = new HashSet<>();
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, showId);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        sold.add(rs.getString("seat_label"));
                    }
                }
            }
            return sold;
        } catch (SQLException e) {
            System.err.println("[ShowHandler] Error fetching sold seats: " + e.getMessage());
            return null;
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private Show mapShow(ResultSet rs) throws SQLException {
        Show s = new Show();
        s.setId(rs.getInt("id"));
        s.setMovieId(rs.getInt("movie_id"));
        s.setTheatreId(rs.getInt("theatre_id"));
        s.setShowDate(rs.getString("show_date"));
        s.setShowTime(rs.getString("show_time"));
        s.setMovieTitle(rs.getString("movie_title"));
        s.setTheatreName(rs.getString("theatre_name"));
        return s;
    }
}

