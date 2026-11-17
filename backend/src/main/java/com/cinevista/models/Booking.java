package com.cinevista.models;

import java.util.List;

/**
 * Represents a booking with associated details.
 */
public class Booking {

    private int bookingId;
    private String ticketId;      // e.g. "CV-a1b2c3d4"
    private int showId;
    private Integer userId;
    private double totalAmount;
    private String status;        // "confirmed"
    private String createdAt;
    private String qrCode;        // Base64 encoded QR code PNG

    // Joined/computed fields for display
    private String movieTitle;
    private String theatreName;
    private String showDate;
    private String showTime;
    private List<String> seats;   // Seat labels
    private List<Seat> seatDetails;

    public Booking() {}

    // --- Getters and Setters ---

    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public int getShowId() { return showId; }
    public void setShowId(int showId) { this.showId = showId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getTheatreName() { return theatreName; }
    public void setTheatreName(String theatreName) { this.theatreName = theatreName; }

    public String getShowDate() { return showDate; }
    public void setShowDate(String showDate) { this.showDate = showDate; }

    public String getShowTime() { return showTime; }
    public void setShowTime(String showTime) { this.showTime = showTime; }

    public List<String> getSeats() { return seats; }
    public void setSeats(List<String> seats) { this.seats = seats; }

    public List<Seat> getSeatDetails() { return seatDetails; }
    public void setSeatDetails(List<Seat> seatDetails) { this.seatDetails = seatDetails; }
}
