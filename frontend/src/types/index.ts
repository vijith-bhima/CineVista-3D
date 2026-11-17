export interface Movie {
  id: number;
  title: string;
  language: string;
  genre: string;
  durationMinutes: number;
  rating: number;
  story: string;
  posterUrl: string;
  teaserUrl: string;
  trailerUrl: string;
  featured: boolean;
  createdAt: string;
}

export interface Theatre {
  id: number;
  name: string;
  location: string;
  distanceKm: number;
  formats: string;
}

export interface Show {
  id: number;
  movieId: number;
  theatreId: number;
  showDate: string; // YYYY-MM-DD
  showTime: string; // HH:MM
  movieTitle: string;
  theatreName: string;
  format?: string;
  basePrice?: number;
}

export type SeatCategory = 'standard' | 'premium' | 'recliner';
export type SeatStatus = 'available' | 'sold' | 'selected';

export interface Seat {
  label: string;
  row: string;
  number: number;
  category: SeatCategory;
  price: number;
  status: SeatStatus;
}

export interface BookingRequest {
  showId: number;
  seats: string[];
  userId?: number | null;
}

export interface Booking {
  bookingId: number;
  ticketId: string;
  showId: number;
  userId?: number | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  qrCode?: string;
  qrCodeBase64?: string;
  movieTitle: string;
  theatreName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  screenNumber?: number;
}

export type CameraPreset = 'Overview' | 'Near screen' | 'Balcony' | 'Top view' | 'My Seat' | 'From Stage' | 'Bird Eye';

