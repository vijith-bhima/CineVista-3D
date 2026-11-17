package com.cinevista;

import com.cinevista.utils.JsonUtil;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Concurrency stress test for atomic booking.
 * Fires 50 simultaneous HTTP POST requests for the exact same seat on the same show.
 * Verifies that exactly 1 succeeds (HTTP 201) and 49 fail with HTTP 409 Conflict.
 */
public class ConcurrentBookingTest {

    private static final String BASE_URL = "http://localhost:8080";
    private static final int CONCURRENT_REQUESTS = 50;

    public static void main(String[] args) throws Exception {
        System.out.println("==================================================");
        System.out.println("  CineVista 3D — 50 Concurrent Booking Stress Test");
        System.out.println("==================================================");

        // 1. Fetch available shows
        URL showsUrl = URI.create(BASE_URL + "/api/shows").toURL();
        String showsJson;
        try (InputStream is = showsUrl.openStream()) {
            showsJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        List<?> shows = JsonUtil.fromJson(showsJson, List.class);
        if (shows.isEmpty()) {
            System.err.println("❌ No shows found. Make sure database is seeded!");
            System.exit(1);
        }
        Map<?, ?> firstShow = (Map<?, ?>) shows.get(0);
        int showId = ((Number) firstShow.get("id")).intValue();

        // 2. Fetch seats and find an available one
        URL seatsUrl = URI.create(BASE_URL + "/api/shows/" + showId + "/seats").toURL();
        String seatsJson;
        try (InputStream is = seatsUrl.openStream()) {
            seatsJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        List<?> seats = JsonUtil.fromJson(seatsJson, List.class);
        String targetSeat = null;
        for (Object sObj : seats) {
            Map<?, ?> s = (Map<?, ?>) sObj;
            if ("available".equals(s.get("status"))) {
                targetSeat = (String) s.get("label");
                break;
            }
        }
        if (targetSeat == null) {
            targetSeat = "J12";
        }

        System.out.println("Target Show ID: " + showId);
        System.out.println("Target Seat:    " + targetSeat);
        System.out.println("Launching " + CONCURRENT_REQUESTS + " simultaneous requests for seat " + targetSeat + "...");

        // 3. Set up synchronized latch to trigger all 50 threads at the EXACT same millisecond
        ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
        CountDownLatch readyLatch = new CountDownLatch(CONCURRENT_REQUESTS);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(CONCURRENT_REQUESTS);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger otherCount = new AtomicInteger(0);

        final String payload = "{\"showId\":" + showId + ",\"seats\":[\"" + targetSeat + "\"]}";
        final byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);

        for (int i = 0; i < CONCURRENT_REQUESTS; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // Wait for green light
                    HttpURLConnection conn = (HttpURLConnection) URI.create(BASE_URL + "/api/bookings").toURL().openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(5000);
                    conn.setReadTimeout(5000);

                    try (OutputStream os = conn.getOutputStream()) {
                        os.write(payloadBytes);
                    }

                    int code = conn.getResponseCode();
                    if (code == 200 || code == 201) {
                        successCount.incrementAndGet();
                    } else if (code == 409) {
                        conflictCount.incrementAndGet();
                    } else {
                        otherCount.incrementAndGet();
                        System.err.println("Unexpected status: " + code);
                    }
                    conn.disconnect();
                } catch (Exception e) {
                    otherCount.incrementAndGet();
                    System.err.println("Request error: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Wait until all 50 threads are waiting at the gate
        readyLatch.await();
        System.out.println("All 50 threads synchronized. Firing simultaneously!");
        startLatch.countDown(); // FIRE!

        // Wait for all to finish
        doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        System.out.println("\n--- RESULTS ---");
        System.out.println("Total requests:  " + CONCURRENT_REQUESTS);
        System.out.println("201 Created:     " + successCount.get());
        System.out.println("409 Conflict:    " + conflictCount.get());
        System.out.println("Other/Failed:    " + otherCount.get());

        if (successCount.get() == 1 && conflictCount.get() == 49 && otherCount.get() == 0) {
            System.out.println("\n🎉 PASS: ZERO double-bookings! Exactly 1 booking succeeded, 49 rejected with 409 Conflict.");
        } else {
            System.err.println("\n❌ FAIL: Concurrency violation or unexpected error count!");
            System.exit(1);
        }
    }
}

