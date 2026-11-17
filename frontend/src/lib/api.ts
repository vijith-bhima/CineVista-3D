import { Movie, Theatre, Show, Seat, BookingRequest, Booking } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errObj = await res.json();
      if (errObj && errObj.error) {
        errorMsg = errObj.error;
      }
    } catch {
      // Non-JSON response
    }
    const err = new Error(errorMsg);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export async function getMovies(): Promise<Movie[]> {
  return fetchJson<Movie[]>(`${API_BASE}/movies`);
}

export async function getMovie(id: number): Promise<Movie> {
  return fetchJson<Movie>(`${API_BASE}/movies/${id}`);
}

export async function getTheatres(): Promise<Theatre[]> {
  return fetchJson<Theatre[]>(`${API_BASE}/theatres`);
}

export async function getShows(movieId?: number, date?: string, theatreId?: number): Promise<Show[]> {
  const params = new URLSearchParams();
  if (movieId) params.append('movieId', String(movieId));
  if (date) params.append('date', date);
  if (theatreId) params.append('theatreId', String(theatreId));
  const query = params.toString();
  return fetchJson<Show[]>(`${API_BASE}/shows${query ? `?${query}` : ''}`);
}

export async function getShow(id: number): Promise<Show> {
  return fetchJson<Show>(`${API_BASE}/shows/${id}`);
}

export async function getSeats(showId: number): Promise<Seat[]> {
  return fetchJson<Seat[]>(`${API_BASE}/shows/${showId}/seats`);
}

export async function getBestSeats(showId: number, qty: number): Promise<string[]> {
  return fetchJson<string[]>(`${API_BASE}/shows/${showId}/best?qty=${qty}`);
}

export async function createBooking(req: BookingRequest): Promise<Booking> {
  return fetchJson<Booking>(`${API_BASE}/bookings`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getBookings(): Promise<Booking[]> {
  return fetchJson<Booking[]>(`${API_BASE}/bookings`);
}

export async function getBooking(ticketId: string): Promise<Booking> {
  return fetchJson<Booking>(`${API_BASE}/bookings/${ticketId}`);
}

