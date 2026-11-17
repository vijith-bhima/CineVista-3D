package com.cinevista.handlers;

import com.cinevista.config.DatabaseConfig;
import com.cinevista.models.Theatre;
import com.cinevista.utils.ResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Handles theatre-related endpoints:
 * GET /api/theatres
 * GET /api/theatres/{id}
 */
public class TheatreHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if (!"GET".equalsIgnoreCase(method)) {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
            return;
        }

        String idParam = ResponseUtil.extractPathParam(path, "/api/theatres/");
        if (idParam != null && !idParam.isEmpty()) {
            try {
                int theatreId = Integer.parseInt(idParam);
                handleGetTheatreById(exchange, theatreId);
            } catch (NumberFormatException e) {
                ResponseUtil.sendError(exchange, 400, "Invalid theatre ID");
            }
        } else {
            handleGetAllTheatres(exchange);
        }
    }

    private void handleGetAllTheatres(HttpExchange exchange) throws IOException {
        String sql = "SELECT id, name, location, distance_km, formats FROM theatres ORDER BY distance_km ASC";
        List<Theatre> theatres = new ArrayList<>();
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    theatres.add(mapTheatre(rs));
                }
            }
            ResponseUtil.sendJson(exchange, 200, theatres);
        } catch (SQLException e) {
            System.err.println("[TheatreHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetTheatreById(HttpExchange exchange, int theatreId) throws IOException {
        String sql = "SELECT id, name, location, distance_km, formats FROM theatres WHERE id = ?";
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, theatreId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        ResponseUtil.sendJson(exchange, 200, mapTheatre(rs));
                    } else {
                        ResponseUtil.sendError(exchange, 404, "Theatre not found");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[TheatreHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private Theatre mapTheatre(ResultSet rs) throws SQLException {
        Theatre t = new Theatre();
        t.setId(rs.getInt("id"));
        t.setName(rs.getString("name"));
        t.setLocation(rs.getString("location"));
        t.setDistanceKm(rs.getDouble("distance_km"));
        t.setFormats(rs.getString("formats"));
        return t;
    }
}

