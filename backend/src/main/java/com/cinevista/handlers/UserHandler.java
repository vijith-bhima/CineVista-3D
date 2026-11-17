package com.cinevista.handlers;

import com.cinevista.config.DatabaseConfig;
import com.cinevista.models.User;
import com.cinevista.utils.JsonUtil;
import com.cinevista.utils.PasswordUtil;
import com.cinevista.utils.ResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

/**
 * Handles user authentication:
 * POST /api/auth/register
 * POST /api/auth/login
 */
public class UserHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if (!"POST".equalsIgnoreCase(method)) {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
            return;
        }

        if (path.endsWith("/register")) {
            handleRegister(exchange);
        } else if (path.endsWith("/login")) {
            handleLogin(exchange);
        } else {
            ResponseUtil.sendError(exchange, 404, "Endpoint not found");
        }
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        String body = ResponseUtil.readRequestBody(exchange);
        User req;
        try {
            req = JsonUtil.fromJson(body, User.class);
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, "Invalid JSON body");
            return;
        }

        if (req == null || req.getUsername() == null || req.getEmail() == null || req.getPassword() == null ||
            req.getUsername().trim().isEmpty() || req.getEmail().trim().isEmpty() || req.getPassword().isEmpty()) {
            ResponseUtil.sendError(exchange, 400, "Username, email, and password are required");
            return;
        }

        String passwordHash = PasswordUtil.hash(req.getPassword());
        String sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'user') " +
                     "RETURNING id, username, email, role, created_at";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, req.getUsername().trim());
                stmt.setString(2, req.getEmail().trim().toLowerCase());
                stmt.setString(3, passwordHash);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        User user = new User();
                        user.setId(rs.getInt("id"));
                        user.setUsername(rs.getString("username"));
                        user.setEmail(rs.getString("email"));
                        user.setRole(rs.getString("role"));
                        user.setCreatedAt(rs.getString("created_at"));
                        ResponseUtil.sendJson(exchange, 201, user);
                        return;
                    }
                }
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                ResponseUtil.sendError(exchange, 409, "Username or email is already registered");
            } else {
                System.err.println("[UserHandler] Register error: " + e.getMessage());
                ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
            }
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        String body = ResponseUtil.readRequestBody(exchange);
        User req;
        try {
            req = JsonUtil.fromJson(body, User.class);
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, "Invalid JSON body");
            return;
        }

        if (req == null || req.getUsername() == null || req.getPassword() == null) {
            ResponseUtil.sendError(exchange, 400, "Username and password are required");
            return;
        }

        String sql = "SELECT id, username, email, password_hash, role, created_at FROM users " +
                     "WHERE username = ? OR email = ?";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, req.getUsername().trim());
                stmt.setString(2, req.getUsername().trim().toLowerCase());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        String storedHash = rs.getString("password_hash");
                        if (PasswordUtil.verify(req.getPassword(), storedHash)) {
                            User user = new User();
                            user.setId(rs.getInt("id"));
                            user.setUsername(rs.getString("username"));
                            user.setEmail(rs.getString("email"));
                            user.setRole(rs.getString("role"));
                            user.setCreatedAt(rs.getString("created_at"));
                            ResponseUtil.sendJson(exchange, 200, user);
                            return;
                        }
                    }
                    ResponseUtil.sendError(exchange, 401, "Invalid username or password");
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserHandler] Login error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }
}

