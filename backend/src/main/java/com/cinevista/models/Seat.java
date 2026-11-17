package com.cinevista.models;

/**
 * Represents a seat in the theatre layout.
 * Seats are generated dynamically (not stored in DB).
 * Status is determined by checking booking_seats for sold seats.
 */
public class Seat {

    private String label;    // e.g. "A1", "E6", "J12"
    private String row;      // e.g. "A", "E", "J"
    private int number;      // 1-12
    private String category; // "standard", "premium", "recliner"
    private double price;    // 150, 250, 400
    private String status;   // "available" or "sold"

    public Seat() {}

    public Seat(String label, String row, int number, String category, double price, String status) {
        this.label = label;
        this.row = row;
        this.number = number;
        this.category = category;
        this.price = price;
        this.status = status;
    }

    // --- Getters and Setters ---

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getRow() { return row; }
    public void setRow(String row) { this.row = row; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    /**
     * Get the seat category based on row letter.
     * A-D = standard (Rs.150), E-K = premium (Rs.250), L-M = recliner (Rs.400)
     */
    public static String categoryForRow(char row) {
        if (row >= 'A' && row <= 'D') return "standard";
        if (row >= 'E' && row <= 'K') return "premium";
        if (row >= 'L' && row <= 'M') return "recliner";
        return "standard";
    }

    /**
     * Get the price for a seat category.
     */
    public static double priceForCategory(String category) {
        return switch (category) {
            case "premium" -> 250.0;
            case "recliner" -> 400.0;
            default -> 150.0; // standard
        };
    }
}
