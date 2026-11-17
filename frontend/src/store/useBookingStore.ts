import { create } from 'zustand';
import { Movie, Theatre, Show, Seat, CameraPreset } from '@/types';

export interface HoveredSeatInfo {
  label: string;
  row: string;
  number: number;
  category: string;
  price: number;
  x?: number;
  y?: number;
}

interface BookingState {
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedDate: string; // YYYY-MM-DD
  selectedShow: Show | null;
  selectedSeats: string[]; // max 6
  cameraPreset: CameraPreset;
  soundEnabled: boolean;
  videoPlaying: boolean;
  activeSeatEyeView: string | null; // which seat the camera is currently inside
  viewMode: '3D' | '2D';
  houseLights: boolean; // false = movie mode (dark), true = house lights on
  isTouring: boolean;
  isTheatreView: boolean;
  hoveredSeatInfo: HoveredSeatInfo | null;
  zoomCommand: 'in' | 'out' | 'reset' | null;

  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedTheatre: (theatre: Theatre | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedShow: (show: Show | null) => void;
  toggleSeat: (seatLabel: string, seatPrice?: number) => boolean;
  setSelectedSeats: (seats: string[]) => void;
  clearSeats: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setVideoPlaying: (playing: boolean) => void;
  toggleVideoPlaying: () => void;
  setActiveSeatEyeView: (seatLabel: string | null) => void;
  setViewMode: (mode: '3D' | '2D') => void;
  toggleHouseLights: () => void;
  setIsTouring: (touring: boolean) => void;
  toggleTour: () => void;
  setIsTheatreView: (theatreView: boolean) => void;
  toggleTheatreView: () => void;
  setHoveredSeatInfo: (info: HoveredSeatInfo | null) => void;
  triggerZoomIn: () => void;
  triggerZoomOut: () => void;
  triggerResetView: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedTheatre: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedShow: null,
  selectedSeats: [],
  cameraPreset: 'Overview',
  soundEnabled: false,
  videoPlaying: true,
  activeSeatEyeView: null,
  viewMode: '3D',
  houseLights: false,
  isTouring: false,
  isTheatreView: false,
  hoveredSeatInfo: null,
  zoomCommand: null,

  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setSelectedTheatre: (theatre) => set({ selectedTheatre: theatre }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedShow: (show) => set({ selectedShow: show }),

  toggleSeat: (seatLabel: string) => {
    const { selectedSeats } = get();
    if (selectedSeats.includes(seatLabel)) {
      const next = selectedSeats.filter((s) => s !== seatLabel);
      set({
        selectedSeats: next,
        activeSeatEyeView: next.length > 0 ? next[next.length - 1] : null,
      });
      return true;
    } else {
      if (selectedSeats.length >= 6) {
        return false; // Max 6 seats limit
      }
      const next = [...selectedSeats, seatLabel];
      set({
        selectedSeats: next,
        activeSeatEyeView: seatLabel,
      });
      return true;
    }
  },

  setSelectedSeats: (seats) => {
    const clamped = seats.slice(0, 6);
    set({
      selectedSeats: clamped,
      activeSeatEyeView: clamped.length > 0 ? clamped[clamped.length - 1] : null,
    });
  },

  clearSeats: () =>
    set({
      selectedSeats: [],
      activeSeatEyeView: null,
      cameraPreset: 'Overview',
      hoveredSeatInfo: null,
    }),

  setCameraPreset: (preset) => {
    set({
      cameraPreset: preset,
      isTouring: false,
    });
  },

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setVideoPlaying: (playing) => set({ videoPlaying: playing }),
  toggleVideoPlaying: () => set((state) => ({ videoPlaying: !state.videoPlaying })),
  setActiveSeatEyeView: (seatLabel) => set({ activeSeatEyeView: seatLabel, cameraPreset: 'My Seat', isTouring: false }),
  setViewMode: (mode) => set({ viewMode: mode, cameraPreset: mode === '2D' ? 'Top view' : 'Overview' }),
  toggleHouseLights: () => set((state) => ({ houseLights: !state.houseLights })),
  setIsTouring: (touring) => set({ isTouring: touring }),
  toggleTour: () => set((state) => ({ isTouring: !state.isTouring, cameraPreset: 'Overview' })),
  setIsTheatreView: (theatreView) => set({ isTheatreView: theatreView }),
  toggleTheatreView: () => set((state) => ({ isTheatreView: !state.isTheatreView })),
  setHoveredSeatInfo: (info) => set({ hoveredSeatInfo: info }),

  triggerZoomIn: () => set({ zoomCommand: 'in' }),
  triggerZoomOut: () => set({ zoomCommand: 'out' }),
  triggerResetView: () => set({ zoomCommand: 'reset', cameraPreset: 'Overview', isTouring: false }),

  resetBooking: () =>
    set({
      selectedSeats: [],
      cameraPreset: 'Overview',
      soundEnabled: false,
      activeSeatEyeView: null,
      isTouring: false,
      hoveredSeatInfo: null,
      houseLights: false,
    }),
}));
