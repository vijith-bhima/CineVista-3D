# CineVista 3D - API Endpoint Test Script
# Tests all REST API endpoints sequentially

$BASE = "http://localhost:8080"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  CineVista 3D - API Test Suite" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Test GET /api/movies
Write-Host "`n=== GET /api/movies ===" -ForegroundColor Cyan
$movies = Invoke-RestMethod -Uri "$BASE/api/movies" -Method Get
Write-Host "Found $($movies.Count) movies"
$movies | ForEach-Object { Write-Host "  - $($_.title) ($($_.language), $($_.genre))" }

# Test GET /api/theatres  
Write-Host "`n=== GET /api/theatres ===" -ForegroundColor Cyan
$theatres = Invoke-RestMethod -Uri "$BASE/api/theatres" -Method Get
Write-Host "Found $($theatres.Count) theatres"
$theatres | ForEach-Object { Write-Host "  - $($_.name) @ $($_.location) ($($_.formats))" }

# Test GET /api/shows?movieId=1&date=<today>
$today = (Get-Date).ToString("yyyy-MM-dd")
Write-Host "`n=== GET /api/shows?movieId=1&date=$today ===" -ForegroundColor Cyan
$shows = Invoke-RestMethod -Uri "$BASE/api/shows?movieId=1&date=$today" -Method Get
Write-Host "Found $($shows.Count) shows"

# If we have shows, test seats and booking
if ($shows.Count -gt 0) {
    $showId = $shows[0].id
    
    # Test GET /api/shows/{id}/seats
    Write-Host "`n=== GET /api/shows/$showId/seats ===" -ForegroundColor Cyan
    $seats = Invoke-RestMethod -Uri "$BASE/api/shows/$showId/seats" -Method Get
    $availableSeats = $seats | Where-Object { $_.status -eq 'available' }
    $available = ($availableSeats).Count
    $sold = ($seats | Where-Object { $_.status -eq 'sold' }).Count
    Write-Host "Total: $($seats.Count), Available: $available, Sold: $sold"
    
    # Test GET /api/shows/{id}/best?qty=3
    Write-Host "`n=== GET /api/shows/$showId/best?qty=3 ===" -ForegroundColor Cyan
    $best = Invoke-RestMethod -Uri "$BASE/api/shows/$showId/best?qty=3" -Method Get
    Write-Host "Best seats: $($best -join ', ')"
    
    # Test POST /api/bookings with available seats
    Write-Host "`n=== POST /api/bookings ===" -ForegroundColor Cyan
    $targetSeats = $availableSeats | Select-Object -First 2 | ForEach-Object { $_.label }
    if ($targetSeats.Count -ge 2) {
        $body = @{ showId = $showId; seats = $targetSeats } | ConvertTo-Json
        $booking = Invoke-RestMethod -Uri "$BASE/api/bookings" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Booking created: $($booking.ticketId), Total: Rs.$($booking.totalAmount)"
        Write-Host "Seats booked: $($booking.seats -join ', ')"
        Write-Host "QR Code generated: $($booking.qrCode.Substring(0, 40))..."
        
        # Test double booking on the seat we just booked (should fail with 409)
        Write-Host "`n=== TEST: Double booking (expect 409) ===" -ForegroundColor Yellow
        try {
            $doubleBody = @{ showId = $showId; seats = @($targetSeats[0]) } | ConvertTo-Json
            Invoke-RestMethod -Uri "$BASE/api/bookings" -Method Post -Body $doubleBody -ContentType "application/json"
            Write-Host "ERROR: Double booking was allowed!" -ForegroundColor Red
        } catch {
            Write-Host "PASS: Double booking rejected with status $($_.Exception.Response.StatusCode)" -ForegroundColor Green
        }
    } else {
        Write-Host "WARNING: Not enough available seats to run booking test." -ForegroundColor Yellow
    }
    
    # Test GET /api/bookings
    Write-Host "`n=== GET /api/bookings ===" -ForegroundColor Cyan
    $allBookings = Invoke-RestMethod -Uri "$BASE/api/bookings" -Method Get
    Write-Host "Total bookings: $($allBookings.Count)"
} else {
    Write-Host "WARNING: No shows found for today. Skipping seat/booking tests." -ForegroundColor Yellow
}

Write-Host "`n=== All tests complete ===" -ForegroundColor Green
