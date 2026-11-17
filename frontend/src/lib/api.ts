import { Movie, Theatre, Show, Seat, BookingRequest, Booking } from '@/types';
import { supabase, isSupabaseConfigured, resolveMediaUrl } from './supabase';

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
    } catch {}
    const err = new Error(errorMsg);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

// Map snake_case database row to camelCase Movie object
function mapDbMovie(row: any): Movie {
  return {
    id: row.id,
    title: row.title,
    language: row.language,
    genre: row.genre,
    durationMinutes: row.duration_minutes || row.durationMinutes,
    rating: Number(row.rating || 0),
    story: row.story,
    posterUrl: resolveMediaUrl(row.poster_url || row.posterUrl),
    teaserUrl: resolveMediaUrl(row.teaser_url || row.teaserUrl),
    trailerUrl: resolveMediaUrl(row.trailer_url || row.trailerUrl),
    featured: Boolean(row.featured),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export async function getMovies(): Promise<Movie[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('movies').select('*').order('id');
      if (!error && data && data.length > 0) {
        return data.map(mapDbMovie);
      }
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for movies:', e);
    }
  }
  const movies = await fetchJson<Movie[]>(`${API_BASE}/movies`);
  return movies.map((m) => ({
    ...m,
    posterUrl: resolveMediaUrl(m.posterUrl),
    teaserUrl: resolveMediaUrl(m.teaserUrl),
    trailerUrl: resolveMediaUrl(m.trailerUrl),
  }));
}

export async function getMovie(id: number): Promise<Movie> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('movies').select('*').eq('id', id).single();
      if (!error && data) {
        return mapDbMovie(data);
      }
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for movie:', e);
    }
  }
  const m = await fetchJson<Movie>(`${API_BASE}/movies/${id}`);
  return {
    ...m,
    posterUrl: resolveMediaUrl(m.posterUrl),
    teaserUrl: resolveMediaUrl(m.teaserUrl),
    trailerUrl: resolveMediaUrl(m.trailerUrl),
  };
}

export async function getTheatres(): Promise<Theatre[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('theatres').select('*').order('distance_km');
      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          location: t.location,
          distanceKm: Number(t.distance_km || t.distanceKm || 0),
          formats: t.formats,
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for theatres:', e);
    }
  }
  return fetchJson<Theatre[]>(`${API_BASE}/theatres`);
}

export async function getShows(movieId?: number, date?: string, theatreId?: number): Promise<Show[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('shows').select('*, movies(title), theatres(name, formats)');
      if (movieId) query = query.eq('movie_id', movieId);
      if (date) query = query.eq('show_date', date);
      if (theatreId) query = query.eq('theatre_id', theatreId);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((s: any) => ({
          id: s.id,
          movieId: s.movie_id,
          theatreId: s.theatre_id,
          showDate: s.show_date,
          showTime: s.show_time,
          movieTitle: s.movies?.title || '',
          theatreName: s.theatres?.name || '',
          format: s.theatres?.formats?.split(',')[0] || '3D',
          basePrice: 250,
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for shows:', e);
    }
  }

  const params = new URLSearchParams();
  if (movieId) params.append('movieId', String(movieId));
  if (date) params.append('date', date);
  if (theatreId) params.append('theatreId', String(theatreId));
  const q = params.toString();
  return fetchJson<Show[]>(`${API_BASE}/shows${q ? `?${q}` : ''}`);
}

export async function getShow(id: number): Promise<Show> {
  return fetchJson<Show>(`${API_BASE}/shows/${id}`);
}

export async function getSeats(showId: number): Promise<Seat[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Query booked seats from Supabase
      const { data: booked } = await supabase
        .from('booking_seats')
        .select('seat_label')
        .eq('show_id', showId);

      const bookedSet = new Set((booked || []).map((b: any) => b.seat_label));

      // Generate 120-seat matrix matching theatre layout
      const seatList: Seat[] = [];
      const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      for (const r of rowLetters) {
        for (let num = 1; num <= 12; num++) {
          const label = `${r}${num}`;
          const isStandard = r <= 'D';
          const isPremium = r >= 'E' && r <= 'H';
          const cat = isStandard ? 'standard' : isPremium ? 'premium' : 'recliner';
          const price = isStandard ? 150 : isPremium ? 240 : 550;
          const status = bookedSet.has(label) ? 'sold' : 'available';

          seatList.push({
            label,
            row: r,
            number: num,
            category: cat as any,
            price,
            status,
          });
        }
      }
      return seatList;
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for seats:', e);
    }
  }

  return fetchJson<Seat[]>(`${API_BASE}/shows/${showId}/seats`);
}

export async function getBestSeats(showId: number, qty: number): Promise<string[]> {
  return fetchJson<string[]>(`${API_BASE}/shows/${showId}/best?qty=${qty}`);
}

export async function createBooking(req: BookingRequest): Promise<Booking> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const ticketId = 'CV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const seatTotal = req.seats.reduce((sum, s) => {
        const row = s.charAt(0).toUpperCase();
        return sum + (row >= 'I' ? 550 : row >= 'E' ? 240 : 150);
      }, 0);
      const totalAmount = seatTotal + req.seats.length * 25 * 1.18;

      // Insert booking record
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .insert({
          show_id: req.showId,
          user_id: req.userId || null,
          ticket_id: ticketId,
          total_amount: totalAmount,
          status: 'confirmed',
        })
        .select()
        .single();

      if (!bError && bData) {
        // Insert seats
        const seatInserts = req.seats.map((s) => {
          const row = s.charAt(0).toUpperCase();
          const cat = row >= 'I' ? 'recliner' : row >= 'E' ? 'premium' : 'standard';
          const price = row >= 'I' ? 550 : row >= 'E' ? 240 : 150;
          return {
            booking_id: bData.id,
            show_id: req.showId,
            seat_label: s,
            category: cat,
            price,
          };
        });

        await supabase.from('booking_seats').insert(seatInserts);

        return {
          bookingId: bData.id,
          ticketId,
          showId: req.showId,
          userId: req.userId,
          totalAmount,
          status: 'CONFIRMED',
          createdAt: bData.created_at,
          movieTitle: 'Feature Presentation',
          theatreName: 'CineVista Multiplex',
          showDate: new Date().toISOString().split('T')[0],
          showTime: '10:00:00',
          seats: req.seats,
          screenNumber: 2,
        };
      }
    } catch (e) {
      console.warn('[Supabase] Falling back to REST API for booking:', e);
    }
  }

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
