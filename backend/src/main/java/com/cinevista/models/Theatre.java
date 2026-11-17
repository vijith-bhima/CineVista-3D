package com.cinevista.models;

/**
 * Represents a theatre/cinema hall.
 */
public class Theatre {

    private int id;
    private String name;
    private String location;
    private double distanceKm;
    private String formats; // Comma-separated, e.g. "2D,IMAX,4DX"

    public Theatre() {}

    // --- Getters and Setters ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public String getFormats() { return formats; }
    public void setFormats(String formats) { this.formats = formats; }
}
