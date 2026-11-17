package com.cinevista.config;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

/**
 * CORS handler that wraps another HttpHandler.
 * Adds CORS headers to every response and handles OPTIONS preflight requests.
 */
public class CorsHandler implements HttpHandler {

    private final HttpHandler wrappedHandler;
    private final String allowedOrigin;

    public CorsHandler(HttpHandler wrappedHandler) {
        this.wrappedHandler = wrappedHandler;
        this.allowedOrigin = EnvConfig.get("CORS_ORIGIN", "http://localhost:5173");
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Headers responseHeaders = exchange.getResponseHeaders();

        // Add CORS headers to every response
        responseHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        responseHeaders.set("Access-Control-Max-Age", "86400");

        // Handle preflight OPTIONS request
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        // Delegate to the wrapped handler
        wrappedHandler.handle(exchange);
    }
}
