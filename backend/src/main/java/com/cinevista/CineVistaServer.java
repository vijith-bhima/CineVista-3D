package com.cinevista;

import com.cinevista.config.CorsHandler;
import com.cinevista.config.DatabaseConfig;
import com.cinevista.config.EnvConfig;
import com.cinevista.handlers.*;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * CineVista 3D Backend Server
 * Built with plain JDK HttpServer (no frameworks).
 */
public class CineVistaServer {

    public static void main(String[] args) {
        int port = EnvConfig.getInt("SERVER_PORT", 8080);

        System.out.println("==================================================");
        System.out.println("  🎬 CineVista 3D Server starting on port " + port);
        System.out.println("==================================================");

        // 1. Initialize Database Connection Pool
        try {
            DatabaseConfig.init();
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize database: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }

        // 2. Locate public media directory
        String publicDir = "../public";
        if (!new File(publicDir).exists()) {
            publicDir = "public";
        }
        if (!new File(publicDir).exists()) {
            publicDir = "./public";
        }

        // 3. Start HTTP Server
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            server.setExecutor(Executors.newFixedThreadPool(32));

            // Register API Handlers wrapped with CORS
            server.createContext("/api/movies", new CorsHandler(new MovieHandler()));
            server.createContext("/api/theatres", new CorsHandler(new TheatreHandler()));
            server.createContext("/api/shows", new CorsHandler(new ShowHandler()));
            server.createContext("/api/bookings", new CorsHandler(new BookingHandler()));
            server.createContext("/api/auth", new CorsHandler(new UserHandler()));
            server.createContext("/media", new CorsHandler(new MediaHandler(publicDir)));

            // Health check
            server.createContext("/api/health", new CorsHandler(exchange -> {
                String response = "{\"status\":\"UP\",\"service\":\"CineVista 3D API\"}";
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.length());
                exchange.getResponseBody().write(response.getBytes());
                exchange.getResponseBody().close();
            }));

            server.start();

            System.out.println("✅ CineVista 3D Server is running!");
            System.out.println("👉 Health check: http://localhost:" + port + "/api/health");
            System.out.println("👉 Movies:       http://localhost:" + port + "/api/movies");
            System.out.println("👉 Theatres:     http://localhost:" + port + "/api/theatres");
            System.out.println("👉 Shows:        http://localhost:" + port + "/api/shows");
            System.out.println("👉 Bookings:     http://localhost:" + port + "/api/bookings");
            System.out.println("==================================================");

            // Graceful shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\nStopping CineVista 3D Server...");
                server.stop(1);
                System.out.println("Server stopped cleanly.");
            }));

        } catch (IOException e) {
            System.err.println("❌ Error starting HTTP server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

