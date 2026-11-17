package com.cinevista.handlers;

import com.cinevista.config.DatabaseConfig;
import com.cinevista.models.Movie;
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
 * Handles movie-related endpoints:
 * GET /api/movies
 * GET /api/movies/{id}
 */
public class MovieHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if (!"GET".equalsIgnoreCase(method)) {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
            return;
        }

        String idParam = ResponseUtil.extractPathParam(path, "/api/movies/");
        if (idParam != null && !idParam.isEmpty()) {
            try {
                int movieId = Integer.parseInt(idParam);
                handleGetMovieById(exchange, movieId);
            } catch (NumberFormatException e) {
                ResponseUtil.sendError(exchange, 400, "Invalid movie ID");
            }
        } else {
            handleGetAllMovies(exchange);
        }
    }

    private void handleGetAllMovies(HttpExchange exchange) throws IOException {
        String sql = "SELECT id, title, language, genre, duration_minutes, rating, story, poster_url, teaser_url, trailer_url, featured, created_at " +
                     "FROM movies ORDER BY featured DESC, rating DESC, id ASC";

        List<Movie> movies = new ArrayList<>();
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    movies.add(mapMovie(rs));
                }
            }
            ResponseUtil.sendJson(exchange, 200, movies);
        } catch (SQLException e) {
            System.err.println("[MovieHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private void handleGetMovieById(HttpExchange exchange, int movieId) throws IOException {
        String sql = "SELECT id, title, language, genre, duration_minutes, rating, story, poster_url, teaser_url, trailer_url, featured, created_at " +
                     "FROM movies WHERE id = ?";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, movieId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        ResponseUtil.sendJson(exchange, 200, mapMovie(rs));
                    } else {
                        ResponseUtil.sendError(exchange, 404, "Movie not found");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[MovieHandler] Error: " + e.getMessage());
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    private Movie mapMovie(ResultSet rs) throws SQLException {
        Movie m = new Movie();
        m.setId(rs.getInt("id"));
        m.setTitle(rs.getString("title"));
        m.setLanguage(rs.getString("language"));
        m.setGenre(rs.getString("genre"));
        m.setDurationMinutes(rs.getInt("duration_minutes"));
        m.setRating(rs.getDouble("rating"));
        m.setStory(rs.getString("story"));
        m.setPosterUrl(rs.getString("poster_url"));
        m.setTeaserUrl(rs.getString("teaser_url"));
        m.setTrailerUrl(rs.getString("trailer_url"));
        m.setFeatured(rs.getBoolean("featured"));
        m.setCreatedAt(rs.getString("created_at"));
        return m;
    }
}

