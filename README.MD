# 🎬 CineVista 3D — Immersive 3D Movie Ticket Booking

> A full-stack cinema ticketing web application with a real-time 3D auditorium seat selection experience, spatial camera POV ("Feel the View"), video-textured 3D cinema screen, and ZXing QR e-tickets. Built for SRM University-AP Capstone 2026.

---

## 👥 Team & Governance (SRM University-AP)

| Member | Registration Number | Role & Contribution |
|---|---|---|
| **Bhima Vijith** | `AP25110070408` | **Group Leader & Lead Developer**: Solely implemented all technical architecture, coding, Java backend, WebGL 3D engine, Next.js frontend, database concurrency, and deployment. |
| **NV Bhargav** | `AP25110070576` | **Resource Collection & Media Assets**: Collecting digital resources, media assets (movie posters, teasers, and trailers), and managing asset storage. |
| **A Sai Kishore** | `AP25110071386` | **Project References & UX Benchmarks**: Finding external project references, UI/UX inspiration benchmarks, and reviewing design patterns. |
| **V Koushik** | `AP25110071016` | **Technical Research & Standards**: Technical research, documentation analysis, and exploring database atomicity standards. |
| **B Lakshmi Manoj** | `AP25110071285` | **Requirements Research & PRD Drafting**: Requirements research, user journey analysis, and drafting initial project specifications. |

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | React 18, Zustand, Tailwind CSS, Framer Motion |
| **3D Rendering** | Three.js via `@react-three/fiber` | Real-time WebGL auditorium with video texture on screen & Feel-The-View camera |
| **Backend** | Plain Java 17+ (JDK `HttpServer`) | Zero-framework, low-latency microservices |
| **Database** | PostgreSQL 18 via JDBC Pool | Strict `UNIQUE (show_id, seat_label)` & row-level locking (`FOR UPDATE`) |
| **QR Generation** | Google ZXing (Zebra Crossing) | Base64 scannable digital gate admission barcodes |
| **Theming** | Custom ThemeContext | One-click Dark / Light mode toggle across the entire website |

---

## 🚀 Quick Start Guide

### ⚡ One-Command Launcher (Easiest Way)

Launch all services (**PostgreSQL Database**, **Java Backend**, and **Next.js Frontend**) simultaneously:

- **Double-click** `start-all.bat` in the project root folder.
- **Or run in PowerShell**:
  ```powershell
  cd C:\Cinevista-3D
  .\start-all.ps1
  ```

---

### Prerequisites
- **Java 17+** (JDK 17 or higher)
- **Node.js 18+** & npm
- **PostgreSQL 15+** (configured on port `5433` via `.env`)

---

### Manual Startup (Step by Step)

#### Step 1: Database Setup
```powershell
# 1. Start PostgreSQL server
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Cinevista-3D\backend\pgdata"

# 2. Create database & apply schema and seed data
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -p 5433 -U postgres cinevista
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -p 5433 -U postgres -d cinevista -f "backend/schema.sql"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -p 5433 -U postgres -d cinevista -f "backend/seed.sql"
```

#### Step 2: Build & Start the Plain Java Backend
```cmd
cd C:\Cinevista-3D\backend
build.bat
run.bat
```
Backend runs at `http://localhost:8080`.

#### Step 3: Run the Next.js Frontend
```powershell
cd C:\Cinevista-3D\frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌐 Application Flow & Key Features

1. **6-Row 3D Moving Poster Preloader (`/`)**: 6 distinct lines of posters gliding in 3D perspective across the screen for 3 seconds, transitioning cleanly into the home page.
2. **Explore / Home (`/`)**:
   - Prioritized Hero Carousel showcasing *Ramayana: The Legend*, *Aakasamlo Oka Tara*, and *OM*.
   - Distinct **Coming Soon** row (OM, Aakasamlo Oka Tara, Ramayana) with zero overlap with **Trending Now**.
   - Distinct **Trending Now** row featuring in-theatre blockbusters (*Baahubali*, *RRR*, *Kalki*, *Pushpa 2*, *KGF*).
   - Real-time Multi-Attribute Filter Matrix (by language and genre).
   - Partner Theatres section with distance (km) and projection formats (2D, 3D, IMAX, 4DX).
3. **Movie Details (`/movie/[id]`)**: Fullscreen cinematic video background with audio toggle, metadata pills, synopsis, 7-day sticky date bar, and "Book Showtimes" CTA.
4. **3D Cinema Hall (`/book/[movieId]`)**:
   - **Real-Time 3D Auditorium**: Stepped riser platforms, acoustic wall panels, aisle guide lights, and dollhouse shell.
   - **VideoTexture 3D Screen**: Plays high-definition MP4 trailer on the 3D cinema screen with real-time screen light spill and sound toggle.
   - **"Feel the View" Camera**: Selecting any seat smoothly transitions the camera to that seat's human eye height looking directly at the center of the screen.
   - **Camera Presets & Tour**: Overview, Front, Balcony, Top 2D view, and Automated Hall Tour.
   - **120-Seat Layout (A1–J12)**: Standard (A-D, ₹150), Premium (E-H, ₹240), Recliner (I-J, ₹550).
5. **Checkout (`/checkout`)**: Itemized receipt, promo code engine (`CINE50`, `FIRST100`), payment gateway (UPI/QR, Card, Net Banking, Demo), and atomic double-booking conflict detection.
6. **QR E-Ticket (`/ticket/[ticketId]`)**: Digital boarding pass with unique code, seat identifiers, and Base64 QR code generated via ZXing.
7. **My Tickets (`/tickets`)**: Full booking history with QR passes and print functionality.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies` | Get all 32 movies (ordered by featured and rating) |
| `GET` | `/api/movies/{id}` | Get single movie details |
| `GET` | `/api/theatres` | List all cinema halls with distance and formats |
| `GET` | `/api/shows` | Query shows by `movieId`, `date`, or `theatreId` |
| `GET` | `/api/shows/{id}/seats` | Get full 120-seat availability map |
| `GET` | `/api/shows/{id}/best?qty=N` | Find N adjacent center seats |
| `POST` | `/api/bookings` | Atomically book seats (`409 Conflict` on race condition) |
| `GET` | `/api/bookings` | List all confirmed bookings |
| `GET` | `/api/bookings/{ticketId}` | Get booking details with ZXing QR code |
| `GET` | `/media/*` | Stream video teasers & posters with HTTP 206 Range support |

---

## 📊 Presentation Deliverables

- **PowerPoint Presentation (`.pptx`)**: [`CineVista_3D_Project_Presentation.pptx`](CineVista_3D_Project_Presentation.pptx) and [`CineVista-3D (3).pptx`](CineVista-3D%20(3).pptx)
- **PDF Deck**: [`CineVista_3D_Project_Presentation.pdf`](CineVista_3D_Project_Presentation.pdf) and [`CineVista-3D (3).pdf`](CineVista-3D%20(3).pdf)
- **Interactive Web Slides**: Launch via **`http://localhost:5173/presentation.html`**
