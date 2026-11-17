package com.cinevista.utils;

import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Utility for sending JSON HTTP responses.
 */
public class ResponseUtil {

    /**
     * Send a JSON response with the given status code and body object.
     */
    public static void sendJson(HttpExchange exchange, int statusCode, Object body) throws IOException {
        String json = JsonUtil.toJson(body);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    /**
     * Send a JSON error response.
     * Format: { "error": "message" }
     */
    public static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        sendJson(exchange, statusCode, Map.of("error", message));
    }

    /**
     * Read the request body as a string.
     */
    public static String readRequestBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    /**
     * Extract a path parameter from a URI path.
     * e.g., for path "/api/movies/5" and prefix "/api/movies/", returns "5"
     */
    public static String extractPathParam(String path, String prefix) {
        if (path.startsWith(prefix)) {
            String param = path.substring(prefix.length());
            // Remove trailing slash if present
            if (param.endsWith("/")) {
                param = param.substring(0, param.length() - 1);
            }
            return param;
        }
        return null;
    }

    /**
     * Parse query string into a map.
     * e.g., "movieId=1&date=2024-01-15" -> {movieId: "1", date: "2024-01-15"}
     */
    public static Map<String, String> parseQuery(String query) {
        var params = new java.util.HashMap<String, String>();
        if (query == null || query.isEmpty()) return params;
        for (String pair : query.split("&")) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                String key = pair.substring(0, idx);
                String value = idx < pair.length() - 1 ? pair.substring(idx + 1) : "";
                params.put(key, java.net.URLDecoder.decode(value, StandardCharsets.UTF_8));
            }
        }
        return params;
    }
}
