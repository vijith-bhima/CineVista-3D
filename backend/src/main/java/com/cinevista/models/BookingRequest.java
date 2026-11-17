package com.cinevista.models;

import java.util.List;

/**
 * Request body for creating a booking.
 * Expected JSON: { "showId": 1, "seats": ["E5", "E6"] }
 */
public class BookingRequest {

    private int showId;
    private List<String> seats;

    public BookingRequest() {}

    // --- Getters and Setters ---

    public int getShowId() { return showId; }
    public void setShowId(int showId) { this.showId = showId; }

    public List<String> getSeats() { return seats; }
    public void setSeats(List<String> seats) { this.seats = seats; }
}
