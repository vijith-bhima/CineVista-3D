package com.cinevista.handlers;

import com.cinevista.utils.ResponseUtil;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves static media assets (posters, trailers, teasers) with HTTP Range support for video streaming.
 * Maps URL paths like /media/posters/movie.jpg to filesystem public/posters/movie.jpg
 */
public class MediaHandler implements HttpHandler {

    private final Path publicDir;

    public MediaHandler(String publicDirPath) {
        this.publicDir = Paths.get(publicDirPath).toAbsolutePath().normalize();
        System.out.println("[MediaHandler] Serving media from: " + this.publicDir);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod()) && !"HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            ResponseUtil.sendError(exchange, 405, "Method Not Allowed");
            return;
        }

        String rawPath = exchange.getRequestURI().getPath();
        // Remove "/media/" prefix
        String relPath = rawPath.startsWith("/media/") ? rawPath.substring(7) : rawPath;

        // Prevent path traversal
        Path target = publicDir.resolve(relPath).normalize();
        if (!target.startsWith(publicDir) || !Files.exists(target) || Files.isDirectory(target)) {
            // Also check case insensitivity (e.g. Trailers vs trailers)
            Path altTarget = resolveCaseInsensitive(relPath);
            if (altTarget != null && Files.exists(altTarget) && !Files.isDirectory(altTarget)) {
                target = altTarget;
            } else {
                ResponseUtil.sendError(exchange, 404, "Media file not found: " + relPath);
                return;
            }
        }

        long fileLength = Files.size(target);
        String mime = getMimeType(target.getFileName().toString());

        Headers reqHeaders = exchange.getRequestHeaders();
        Headers resHeaders = exchange.getResponseHeaders();

        resHeaders.set("Content-Type", mime);
        resHeaders.set("Accept-Ranges", "bytes");

        String rangeHeader = reqHeaders.getFirst("Range");
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            // Partial content (206) for video streaming
            handleRangeRequest(exchange, target, fileLength, rangeHeader.substring(6));
        } else {
            // Full content (200)
            resHeaders.set("Content-Length", String.valueOf(fileLength));
            exchange.sendResponseHeaders(200, fileLength);
            if (!"HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
                try (OutputStream os = exchange.getResponseBody();
                     InputStream is = Files.newInputStream(target)) {
                    is.transferTo(os);
                }
            } else {
                exchange.getResponseBody().close();
            }
        }
    }

    private void handleRangeRequest(HttpExchange exchange, Path target, long fileLength, String rangeVal) throws IOException {
        long start = 0;
        long end = fileLength - 1;

        int dash = rangeVal.indexOf('-');
        if (dash != -1) {
            String sStr = rangeVal.substring(0, dash).trim();
            String eStr = rangeVal.substring(dash + 1).trim();
            if (!sStr.isEmpty()) start = Long.parseLong(sStr);
            if (!eStr.isEmpty()) end = Long.parseLong(eStr);
        }

        if (start > end || start >= fileLength) {
            exchange.getResponseHeaders().set("Content-Range", "bytes */" + fileLength);
            exchange.sendResponseHeaders(416, -1);
            exchange.close();
            return;
        }

        long contentLength = end - start + 1;
        Headers resHeaders = exchange.getResponseHeaders();
        resHeaders.set("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
        resHeaders.set("Content-Length", String.valueOf(contentLength));

        exchange.sendResponseHeaders(206, contentLength);

        if (!"HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            try (RandomAccessFile raf = new RandomAccessFile(target.toFile(), "r");
                 OutputStream os = exchange.getResponseBody()) {
                raf.seek(start);
                byte[] buffer = new byte[64 * 1024];
                long remaining = contentLength;
                while (remaining > 0) {
                    int toRead = (int) Math.min(buffer.length, remaining);
                    int read = raf.read(buffer, 0, toRead);
                    if (read == -1) break;
                    os.write(buffer, 0, read);
                    remaining -= read;
                }
            }
        } else {
            exchange.getResponseBody().close();
        }
    }

    private Path resolveCaseInsensitive(String relPath) {
        try {
            String[] parts = relPath.split("[/\\\\]");
            Path curr = publicDir;
            for (String part : parts) {
                if (part.isEmpty()) continue;
                File[] list = curr.toFile().listFiles();
                if (list == null) return null;
                File match = null;
                for (File f : list) {
                    if (f.getName().equalsIgnoreCase(part)) {
                        match = f;
                        break;
                    }
                }
                if (match == null) return null;
                curr = match.toPath();
            }
            return curr;
        } catch (Exception e) {
            return null;
        }
    }

    private String getMimeType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }
}

