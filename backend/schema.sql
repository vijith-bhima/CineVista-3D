-- ============================================================
-- CineVista 3D — PostgreSQL Database Schema
-- ============================================================
-- Drop tables in reverse-dependency order for idempotent runs.
-- ============================================================

DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS bookings      CASCADE;
DROP TABLE IF EXISTS shows         CASCADE;
DROP TABLE IF EXISTS movies        CASCADE;
DROP TABLE IF EXISTS theatres      CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- ============================================================
-- 1. users
-- Stores registered user accounts.
-- Roles: 'user' (default), 'admin'.
-- ============================================================
CREATE TABLE users (
    id            SERIAL       PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users IS 'Registered user accounts for CineVista 3D.';
COMMENT ON COLUMN users.role IS 'Application role — user | admin.';

-- ============================================================
-- 2. movies
-- Master catalogue of movies available on the platform.
-- poster_url, teaser_url, trailer_url are relative paths
-- served by the backend (e.g. /media/posters/movie1.jpg).
-- ============================================================
CREATE TABLE movies (
    id               SERIAL        PRIMARY KEY,
    title            VARCHAR(255)  NOT NULL,
    language         VARCHAR(50)   NOT NULL DEFAULT 'English',
    genre            VARCHAR(100)  NOT NULL,
    duration_minutes INTEGER       NOT NULL,
    rating           DECIMAL(2,1)  CHECK (rating >= 0 AND rating <= 9.9),
    story            TEXT,
    poster_url       VARCHAR(500),
    teaser_url       VARCHAR(500),
    trailer_url      VARCHAR(500),
    featured         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  movies IS 'Movie catalogue — each row is a film CineVista can show.';
COMMENT ON COLUMN movies.featured IS 'TRUE for movies highlighted on the homepage hero section.';
COMMENT ON COLUMN movies.rating IS 'Average user/critic rating on a 0-9.9 scale.';

-- ============================================================
-- 3. theatres
-- Physical cinema halls. `formats` stores the projection
-- formats the theatre supports as a comma-separated string
-- (e.g. ''2D,IMAX,4DX'').
-- ============================================================
CREATE TABLE theatres (
    id          SERIAL        PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    location    VARCHAR(255)  NOT NULL,
    distance_km DECIMAL(3,1)  NOT NULL DEFAULT 0.0,
    formats     VARCHAR(255)  NOT NULL DEFAULT '2D'
);

COMMENT ON TABLE  theatres IS 'Cinema halls where movies are screened.';
COMMENT ON COLUMN theatres.distance_km IS 'Approx. distance from the default city centre (for sorting).';
COMMENT ON COLUMN theatres.formats IS 'Comma-separated projection formats: 2D, 3D, IMAX, 4DX, etc.';

-- ============================================================
-- 4. shows
-- A specific screening of a movie at a theatre on a given
-- date and time. The UNIQUE constraint ensures no two
-- screenings collide in the same auditorium slot.
-- ============================================================
CREATE TABLE shows (
    id         SERIAL  PRIMARY KEY,
    movie_id   INTEGER NOT NULL REFERENCES movies(id)   ON DELETE CASCADE,
    theatre_id INTEGER NOT NULL REFERENCES theatres(id)  ON DELETE CASCADE,
    show_date  DATE    NOT NULL,
    show_time  TIME    NOT NULL,

    -- Prevent duplicate screenings at the same theatre/date/time
    CONSTRAINT uq_show_slot UNIQUE (movie_id, theatre_id, show_date, show_time)
);

CREATE INDEX idx_shows_movie   ON shows (movie_id);
CREATE INDEX idx_shows_theatre ON shows (theatre_id);
CREATE INDEX idx_shows_date    ON shows (show_date);

COMMENT ON TABLE shows IS 'Individual screenings — one row per movie × theatre × date × time.';

-- ============================================================
-- 5. bookings
-- Header record for a ticket purchase. `user_id` is nullable
-- so guest checkout is possible. `ticket_id` is a unique
-- human-readable code like CV-a3f8b1c2.
-- ============================================================
CREATE TABLE bookings (
    id           SERIAL        PRIMARY KEY,
    user_id      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    show_id      INTEGER       NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    ticket_id    VARCHAR(20)   UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status       VARCHAR(20)   NOT NULL DEFAULT 'confirmed',
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_show ON bookings (show_id);

COMMENT ON TABLE  bookings IS 'Ticket purchase header — one row per transaction.';
COMMENT ON COLUMN bookings.ticket_id IS 'Human-readable unique ticket code (CV-xxxxxxxx).';
COMMENT ON COLUMN bookings.status IS 'confirmed | cancelled.';

-- ============================================================
-- 6. booking_seats
-- Individual seats within a booking. The UNIQUE constraint
-- on (show_id, seat_label) is the **critical guard** that
-- prevents double-booking the same seat in the same show.
--
-- Seat layout is generated dynamically on the front end:
--   10 rows (A-J) × 12 seats → labels A1 … J12
--   Rows A-D  → standard
--   Rows E-H  → premium
--   Rows I-J  → recliner
-- There is NO physical seats table; only booked seats exist
-- here, and availability = all labels minus booked labels.
-- ============================================================
CREATE TABLE booking_seats (
    id         SERIAL        PRIMARY KEY,
    booking_id INTEGER       NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    show_id    INTEGER       NOT NULL REFERENCES shows(id)    ON DELETE CASCADE,
    seat_label VARCHAR(5)    NOT NULL,   -- e.g. 'A1', 'J12'
    category   VARCHAR(20)   NOT NULL,   -- standard | premium | recliner
    price      DECIMAL(10,2) NOT NULL,

    -- *** CRITICAL: prevents two bookings from claiming the same seat ***
    CONSTRAINT uq_seat_per_show UNIQUE (show_id, seat_label)
);

CREATE INDEX idx_bseats_booking ON booking_seats (booking_id);
CREATE INDEX idx_bseats_show    ON booking_seats (show_id);

COMMENT ON TABLE  booking_seats IS 'Individual seats tied to a booking — the double-booking guard lives here.';
COMMENT ON COLUMN booking_seats.category IS 'Seat tier: standard (rows A-D), premium (E-H), recliner (I-J).';

-- ============================================================
-- End of schema
-- ============================================================
