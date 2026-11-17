-- ============================================================
-- CineVista 3D — Complete Supabase PostgreSQL Migration Script
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run"
-- ============================================================

-- 1. Drop existing tables if re-running
DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS bookings      CASCADE;
DROP TABLE IF EXISTS shows         CASCADE;
DROP TABLE IF EXISTS movies        CASCADE;
DROP TABLE IF EXISTS theatres      CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- 2. Create Tables
CREATE TABLE users (
    id            SERIAL       PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE movies (
    id               SERIAL        PRIMARY KEY,
    title            VARCHAR(255)  NOT NULL,
    language         VARCHAR(50)   NOT NULL DEFAULT 'English',
    genre            VARCHAR(100)  NOT NULL,
    duration_minutes INTEGER       NOT NULL,
    rating           DECIMAL(2,1),
    story            TEXT,
    poster_url       VARCHAR(500),
    teaser_url       VARCHAR(500),
    trailer_url      VARCHAR(500),
    featured         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE theatres (
    id          SERIAL        PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    location    VARCHAR(255)  NOT NULL,
    distance_km DECIMAL(3,1)  NOT NULL DEFAULT 0.0,
    formats     VARCHAR(255)  NOT NULL DEFAULT '2D'
);

CREATE TABLE shows (
    id         SERIAL  PRIMARY KEY,
    movie_id   INTEGER NOT NULL REFERENCES movies(id)   ON DELETE CASCADE,
    theatre_id INTEGER NOT NULL REFERENCES theatres(id)  ON DELETE CASCADE,
    show_date  DATE    NOT NULL,
    show_time  TIME    NOT NULL,
    CONSTRAINT uq_show_slot UNIQUE (movie_id, theatre_id, show_date, show_time)
);

CREATE TABLE bookings (
    id           SERIAL        PRIMARY KEY,
    user_id      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    show_id      INTEGER       NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    ticket_id    VARCHAR(20)   UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status       VARCHAR(20)   NOT NULL DEFAULT 'confirmed',
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_seats (
    id          SERIAL        PRIMARY KEY,
    booking_id  INTEGER       NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    show_id     INTEGER       NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_label  VARCHAR(10)   NOT NULL,
    category    VARCHAR(20)   NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    CONSTRAINT uq_seat_per_show UNIQUE (show_id, seat_label)
);

-- 3. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Allow public read theatres" ON theatres FOR SELECT USING (true);
CREATE POLICY "Allow public read shows" ON shows FOR SELECT USING (true);
CREATE POLICY "Allow public read booking_seats" ON booking_seats FOR SELECT USING (true);
CREATE POLICY "Allow public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert booking_seats" ON booking_seats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);

-- 4. Seed Users
INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'demo', 'demo@cinevista.com', '1104313fbc4a54c6019dbf2e46b9a89c021c324c08479e390c50b69116c27806', 'user');
SELECT setval('users_id_seq', 1, true);

-- 5. Seed Movies (32 Titles)
INSERT INTO movies (id, title, language, genre, duration_minutes, rating, story, poster_url, teaser_url, trailer_url, featured) VALUES
(1, 'Kalki 2898 AD', 'Telugu', 'Sci-Fi / Action', 181, 8.8, 'Set in a post-apocalyptic dystopian city of Kasi in 2898 AD, Supreme Yaskin rules the Complex. A bounty hunter named Bhairava encounters a pregnant lab subject SUM-80 whose unborn child is destined to save the world, protected by the immortal warrior Ashwatthama.', '/media/posters/Kalki-2898AD.jpg', '/media/trailers/Salar.mp4', '/media/trailers/Salar.mp4', TRUE),
(2, 'RRR (Rise Roar Revolt)', 'Telugu', 'Action / Period', 187, 8.9, 'A fearless revolutionary Alluri Sitarama Raju and an officer in the British army Komaram Bheem forge an unbreakable bond of brotherhood before discovering each other''s true secret identities and mission to free India.', '/media/posters/RRR.jpg', '/media/trailers/RRR Trailer.mp4', '/media/trailers/RRR Trailer.mp4', TRUE),
(3, 'Pushpa 2: The Rule', 'Telugu', 'Action / Crime', 195, 8.7, 'Pushpa Raj has established unmatched dominance over the red sandalwood smuggling empire in Seshachalam. But Bhanwar Singh Shekhawat returns with a vengeance, triggering a lethal high-stakes war between law, power, and the syndicate.', '/media/posters/Pushpa-2.jpg', '/media/trailers/Pushpa 2 The Rule.mp4', '/media/trailers/Pushpa 2 The Rule.mp4', TRUE),
(4, 'Amaran', 'Tamil', 'Action / Biography', 169, 8.5, 'The courageous real-life story of Major Mukund Varadarajan AC of the 44th Rashtriya Rifles, depicting his heroic valor during anti-terror operations in Shopian, Kashmir, and his tender love story with Indu Rebecca Varghese.', '/media/posters/Amaran.jpg', '/media/trailers/Amaran.mp4', '/media/trailers/Amaran.mp4', TRUE),
(5, 'Ala Vaikunthapurramuloo', 'Telugu', 'Action / Comedy', 163, 8.2, 'Bantu is despised and neglected by his father Valmiki, unaware that he was switched at birth with the son of an ultra-wealthy businessman. When he uncovers the truth, he enters the lavish Vaikunthapurram mansion to protect his biological family.', '/media/posters/Ala-vikuntapuramlo.jpg', '/media/trailers/Ala Vaikunthapurramuloo.mp4', '/media/trailers/Ala Vaikunthapurramuloo.mp4', FALSE),
(6, 'Arjun Reddy', 'Telugu', 'Drama / Romance', 182, 8.1, 'A brilliant, short-tempered house surgeon falls into intense self-destructive alcoholism and drug addiction when his beloved Preethi is forced into an arranged marriage with another man.', '/media/posters/Arjun-reddy.jpg', '/media/trailers/Arjun Reddy.mp4', '/media/trailers/Arjun Reddy.mp4', FALSE),
(7, 'K.G.F: Chapter 2', 'Kannada', 'Action / Crime', 168, 8.6, 'Rocky rules Kolar Gold Fields as an undisputed king. However, terrifying adversary Adheera and government minister Ramika Sen threaten his reign, culminating in an earth-shattering struggle for supremacy.', '/media/posters/KGF.jpg', '/media/trailers/KGF.mp4', '/media/trailers/KGF.mp4', TRUE),
(8, 'Salaar: Part 1 – Ceasefire', 'Telugu', 'Action / Thriller', 175, 8.3, 'In the sovereign, lawless city-state of Khansaar, Deva returns to the battlefield to honor an unbreakable childhood vow made to prince Varadharaja Mannar, taking on rival tribes and ruthless armies.', '/media/posters/Salar.jpg', '/media/trailers/Salar.mp4', '/media/trailers/Salar.mp4', FALSE),
(9, 'Vikram', 'Tamil', 'Action / Thriller', 174, 8.4, 'A black-ops commander leads a covert squad tracking a ruthless masked vigilante syndicate while facing drug lord Sandhanam in an adrenaline-pumping cinematic universe.', '/media/posters/Vikram.jpg', '/media/trailers/Vikram.mp4', '/media/trailers/Vikram.mp4', FALSE),
(10, 'Baahubali: The Conclusion', 'Telugu', 'Action / Fantasy', 167, 9.0, 'Amarendra Baahubali discovers the poisonous treachery of Bhallaladeva while Shiva rises to avenge his father''s demise and reclaim the throne of Mahishmati.', '/media/posters/Bahubali.jpg', '/media/trailers/Baahubali - The Beginning.mp4', '/media/trailers/Baahubali - The Beginning.mp4', TRUE),
(11, 'Jersey', 'Telugu', 'Drama / Sport', 157, 8.5, 'A 36-year-old former cricket prodigy decides to make an impossible comeback to the Indian national cricket team to fulfill his son''s wish for an official team jersey.', '/media/posters/Jersy.jpg', '/media/trailers/Jersy.mp4', '/media/trailers/Jersy.mp4', FALSE),
(12, 'Sita Ramam', 'Telugu', 'Romance / Period', 163, 8.6, 'Lieutenant Ram, an orphaned Indian soldier posted in Kashmir, receives anonymous heartfelt letters from a mysterious woman named Sita Mahalakshmi, sparking an immortal timeless romance.', '/media/posters/Sita-ramam.jpg', '/media/trailers/Sita-ramam.mp4', '/media/trailers/Sita-ramam.mp4', FALSE),
(13, 'Kantara: Chapter 1', 'Kannada', 'Mythological / Action', 150, 8.7, 'A sacred forest myth unfolds as ancient forest guardians clash with local nobility to protect ancestral land and divine heritage.', '/media/posters/kantara-2.jpg', '/media/trailers/Kanthara.mp4', '/media/trailers/Kanthara.mp4', FALSE),
(14, 'They Call Him OG', 'Telugu', 'Action / Crime', 160, 8.4, 'Ojas Gambheera, an unstoppable legend in Mumbai''s criminal underworld, re-emerges after a ten-year hiatus to settle blood scores with rival crime syndicates.', '/media/posters/OG.jpg', '/media/trailers/OG.mp4', '/media/trailers/OG.mp4', FALSE),
(15, 'HIT: The 3rd Case', 'Telugu', 'Crime / Mystery', 145, 8.0, 'An uncompromising Homicide Intervention Team officer takes on a gruesome serial killer puzzle that stretches across state borders.', '/media/posters/HIT-3.jpg', '/media/trailers/HIT-3.mp4', '/media/trailers/HIT-3.mp4', FALSE),
(16, 'Jailer 2', 'Tamil', 'Action / Comedy', 165, 8.3, 'Tiger Muthuvel Pandian, a retired prison warden, is pulled back into the shadows to protect his family against an international crime mafia.', '/media/posters/Jailer-2.jpg', '/media/trailers/Jailer2.mp4', '/media/trailers/Jailer2.mp4', FALSE),
(17, 'Major', 'Telugu', 'Action / Biography', 150, 8.2, 'The life and supreme sacrifice of Major Sandeep Unnikrishnan during the 26/11 Taj Hotel Mumbai rescue operations.', '/media/posters/Major.jpg', '/media/trailers/Major.mp4', '/media/trailers/Major.mp4', FALSE),
(18, 'Aravinda Sametha Veera Raghava', 'Telugu', 'Action / Drama', 162, 7.8, 'A young man decides to bury generations of bloodshed and factional feud in Rayalaseema after discovering peace through love and reason.', '/media/posters/Arvinda-sametha.jpg', '/media/trailers/Arvinda-sametha.mp4', '/media/trailers/Arvinda-sametha.mp4', FALSE),
(19, 'Rangasthalam', 'Telugu', 'Period / Action', 179, 8.4, 'In 1980s rural Rangasthalam, Chitti Babu, a partially deaf innocent boat-mechanic, rises against a corrupt local despot to avenge his brother.', '/media/posters/Rangasthalam.jpg', '/media/trailers/Rangasthalam.mp4', '/media/trailers/Rangasthalam.mp4', FALSE),
(20, 'Saaho', 'Telugu', 'Action / Sci-Fi', 170, 7.5, 'An undercover cop gets embroiled in a cutthroat multi-billion dollar gang war for dominance in the high-tech city of Waaji.', '/media/posters/saaho.jpg', '/media/trailers/Saaho.mp4', '/media/trailers/Saaho.mp4', FALSE),
(21, 'Sarrainodu', 'Telugu', 'Action / Masala', 159, 7.6, 'An ex-military officer turns into a ruthless vigilante against a sadistic, politically-connected tyrant terrorizing Andhra Pradesh.', '/media/posters/Sarinodu.jpg', '/media/trailers/sarinodu.mp4', '/media/trailers/sarinodu.mp4', FALSE),
(22, 'Kaithi', 'Tamil', 'Action / Thriller', 145, 8.5, 'Dilli, an ex-convict striving to see his ten-year-old daughter for the first time, must drive a truck full of unconscious cops through a gauntlet of heavily armed drug cartels.', '/media/posters/Khaithi.jpg', '/media/trailers/khaidhi.mp4', '/media/trailers/khaidhi.mp4', FALSE),
(23, 'Maharshi', 'Telugu', 'Drama / Social', 176, 7.9, 'A billionaire tech CEO returns to his native Indian village to help an estranged friend and leads an agricultural revolution for struggling farmers.', '/media/posters/maharshi-indian-movie-poster.jpg', '/media/trailers/Maharshi.mp4', '/media/trailers/Maharshi.mp4', FALSE),
(24, 'Karuppu', 'Tamil', 'Action / Drama', 140, 7.8, 'A gritty tale of retribution and justice in the heart of rural Madurai.', '/media/posters/Karrupu.jpg', '/media/trailers/Vikram.mp4', '/media/trailers/Vikram.mp4', FALSE),
(25, 'Karthikeya 2', 'Telugu', 'Adventure / Mystery', 150, 8.0, 'A rational young doctor travels to Dwarka and discovers an ancient quest involving Lord Krishna''s legendary anklet with secrets for humanity.', '/media/posters/Karthikeya-2.jpg', '/media/trailers/Karthekeyya-2.mp4', '/media/trailers/Karthekeyya-2.mp4', FALSE),
(26, 'Dhurandhar', 'Hindi', 'Action / Thriller', 155, 7.7, 'A high-octane espionage action film charting covert intelligence operations across hostile international borders.', '/media/posters/Dhurandhar.jpg', '/media/trailers/Dhurandhar.mp4', '/media/trailers/Dhurandhar.mp4', FALSE),
(27, 'VIP 2: Lalkar', 'Tamil', 'Comedy / Drama', 133, 7.2, 'Raghuvaran, a determined civil engineer, clashes with an arrogant corporate mogul Vasundhara Parameshwar.', '/media/posters/VIP-2.jpg', '/media/trailers/Ala Vaikunthapurramuloo.mp4', '/media/trailers/Ala Vaikunthapurramuloo.mp4', FALSE),
(28, 'Scene', 'Malayalam', 'Suspense / Thriller', 152, 8.6, 'Six years after the fateful night, Georgekutty faces renewed investigation by police determined to convict him and protect his family.', '/media/posters/Scene.jpg', '/media/trailers/Scene.mp4', '/media/trailers/Scene.mp4', FALSE),
(29, 'Irumudi', 'Malayalam', 'Devotional / Drama', 138, 7.9, 'A pilgrimage that transforms hearts, testing faith and testing brotherhood across sacred hills.', '/media/posters/Irumudi.jpg', '/media/trailers/IRUMUDI.mp4', '/media/trailers/IRUMUDI.mp4', FALSE),
(30, 'Ramayana: The Legend', 'Hindi', 'Epic / Mythological', 170, 8.9, 'The divine saga of Prince Rama, Sita, and Lakshmana during their exile, culminating in the triumphant conquest of Lanka over Ravana.', '/media/posters/worldoframayan.jpg', '/media/trailers/Ramayana- Telugu.mp4', '/media/trailers/Ramayana- Telugu.mp4', TRUE),
(31, 'Aakasamlo Oka Tara', 'Telugu', 'Romance / Drama', 152, 8.4, 'A poignant and uplifting emotional tale about dreams, destiny, and reaching for the stars against all societal odds.', '/media/posters/Akasamlo-okathara.jpg', '/media/trailers/Aakasamlo Oka Tara.mp4', '/media/trailers/Aakasamlo Oka Tara.mp4', TRUE),
(32, 'Om: The Battle Within', 'Hindi', 'Action / Thriller', 135, 7.9, 'An elite para-commando unit operative fights against a high-stakes conspiracy to clear his father''s name and protect the nuclear defense of the nation.', '/media/posters/OM.jpg', '/media/trailers/O.M.mp4', '/media/trailers/O.M.mp4', FALSE);

SELECT setval('movies_id_seq', 32, true);

-- 6. Seed Theatres
INSERT INTO theatres (id, name, location, distance_km, formats) VALUES
(1, 'CineVista Grand IMAX', 'Phoenix Mall, Sector 21', 2.5, '2D,3D,IMAX'),
(2, 'StarPlex Cinemas', 'MG Road, Downtown', 5.8, '2D,3D,4DX'),
(3, 'Metro Cine Lounge', 'Riverside Plaza, East Side', 8.2, '2D,3D'),
(4, 'Galaxy Multiplex', 'Tech Park, Whitefield', 14.0, '2D,3D,IMAX,4DX'),
(5, 'INOX Megacity Mall', 'M.G. Road, Vijayawada', 1.2, '2D,3D,IMAX'),
(6, 'PVR Phoenix Plex', 'Benz Circle, Vijayawada', 3.4, '2D,3D,4DX'),
(7, 'Cinepolis', 'Bandar Road, Vijayawada', 4.1, '2D,3D'),
(8, 'Trendset Mall Cinema', 'Srinivasa Rao Street, Vijayawada', 2.8, '2D,3D'),
(9, 'PVP Square Mall', 'Kothapet, Vijayawada', 5.6, '2D,3D,IMAX');

SELECT setval('theatres_id_seq', 9, true);

-- 7. Generate Shows (Next 7 Days for all 32 movies)
DO $$
DECLARE
    m_id INTEGER;
    t_id INTEGER;
    d INTEGER;
    t TIME;
    times TIME[] := ARRAY['10:00'::TIME, '13:30'::TIME, '17:00'::TIME, '20:30'::TIME, '23:00'::TIME];
BEGIN
    FOR m_id IN 1..32 LOOP
        FOR t_id IN 1..9 LOOP
            IF (m_id % 4 = t_id - 1) OR (m_id <= 10) OR (t_id IN (1, 5, 6, 9)) THEN
                FOR d IN 0..7 LOOP
                    FOREACH t IN ARRAY times LOOP
                        INSERT INTO shows (movie_id, theatre_id, show_date, show_time)
                        VALUES (m_id, t_id, CURRENT_DATE + d, t)
                        ON CONFLICT DO NOTHING;
                    END LOOP;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;
