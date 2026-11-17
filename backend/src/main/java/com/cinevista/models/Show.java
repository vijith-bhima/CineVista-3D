package com.cinevista.models;

/**
 * Represents a movie show (screening) at a theatre on a specific date/time.
 */
public class Show {

    private int id;
    private int movieId;
    private int theatreId;
    private String showDate;  // "YYYY-MM-DD"
    private String showTime;  // "HH:MM"

    // Joined fields (populated in queries that join with movies/theatres)
    private String movieTitle;
    private String theatreName;

    public Show() {}

    // --- Getters and Setters ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMovieId() { return movieId; }
    public void setMovieId(int movieId) { this.movieId = movieId; }

    public int getTheatreId() { return theatreId; }
    public void setTheatreId(int theatreId) { this.theatreId = theatreId; }

    public String getShowDate() { return showDate; }
    public void setShowDate(String showDate) { this.showDate = showDate; }

    public String getShowTime() { return showTime; }
    public void setShowTime(String showTime) { this.showTime = showTime; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getTheatreName() { return theatreName; }
    public void setTheatreName(String theatreName) { this.theatreName = theatreName; }
}
