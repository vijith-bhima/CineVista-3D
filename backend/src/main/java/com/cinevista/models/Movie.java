package com.cinevista.models;

/**
 * Represents a movie in the CineVista system.
 */
public class Movie {

    private int id;
    private String title;
    private String language;
    private String genre;
    private int durationMinutes;
    private double rating;
    private String story;
    private String posterUrl;
    private String teaserUrl;
    private String trailerUrl;
    private boolean featured;
    private String createdAt;

    public Movie() {}

    // --- Getters and Setters ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getStory() { return story; }
    public void setStory(String story) { this.story = story; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getTeaserUrl() { return teaserUrl; }
    public void setTeaserUrl(String teaserUrl) { this.teaserUrl = teaserUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
