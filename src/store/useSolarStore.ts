import { create } from 'zustand';
import { BodyVector } from '../lib/jpl/types';
import { HorizonsCache } from '../lib/jpl/cache';
import { fetchHorizonsVectors } from '../lib/jpl/fetchHorizons';

const BODIES_TO_FETCH = [
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto'
];

let activeAbortController: AbortController | null = null;
let debounceTimeout: NodeJS.Timeout | null = null;

interface SolarState {
  timeSpeed: number; // multiplier where 1 = 1 Earth day per real second in simulation
  simDate: Date;
  selectedBodyId: string | null;
  hoveredBodyId: string | null;
  cameraMode: 'free' | 'follow';
  orbitLinesVisible: boolean;
  scaleMode: 'visual' | 'realistic';
  searchQuery: string;
  isLoaded: boolean;
  showAsteroids: boolean;
  nasaApiKey: string;

  // NASA JPL Horizons state
  planetVectors: Record<string, BodyVector> | null;
  horizonsLoading: boolean;
  horizonsError: string | null;
  lastHorizonsUpdated: Date | null;
  useHorizonsTelemetry: boolean;

  // Actions
  setTimeSpeed: (speed: number) => void;
  setSimDate: (date: Date) => void;
  updateSimDate: (daysToAdd: number) => void;
  setSelectedBodyId: (id: string | null) => void;
  setHoveredBodyId: (id: string | null) => void;
  setCameraMode: (mode: 'free' | 'follow') => void;
  setOrbitLinesVisible: (visible: boolean) => void;
  setScaleMode: (mode: 'visual' | 'realistic') => void;
  setSearchQuery: (query: string) => void;
  setIsLoaded: (loaded: boolean) => void;
  setShowAsteroids: (show: boolean) => void;
  setUseHorizonsTelemetry: (use: boolean) => void;
  fetchHorizonsForDate: (date: Date) => Promise<void>;
  resetSim: () => void;
}

export const useSolarStore = create<SolarState>((set, get) => ({
  timeSpeed: 1,
  simDate: new Date(),
  selectedBodyId: null,
  hoveredBodyId: null,
  cameraMode: 'free',
  orbitLinesVisible: true,
  scaleMode: 'visual',
  searchQuery: '',
  isLoaded: false,
  showAsteroids: true,
  nasaApiKey: process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY',

  // Horizons state defaults
  planetVectors: null,
  horizonsLoading: false,
  horizonsError: null,
  lastHorizonsUpdated: null,
  useHorizonsTelemetry: true,

  setTimeSpeed: (speed) => {
    const wasRunning = get().timeSpeed !== 0;
    const isStopping = speed === 0;
    set({ timeSpeed: speed });

    // Fetch official vectors immediately when pausing the timeline
    if (wasRunning && isStopping && get().useHorizonsTelemetry) {
      get().fetchHorizonsForDate(get().simDate);
    }
  },
  
  setSimDate: (date) => {
    set({ simDate: date });
    
    // Only fetch data if simulation is PAUSED to prevent performance lag
    if (get().useHorizonsTelemetry && get().timeSpeed === 0) {
      get().fetchHorizonsForDate(date);
    }
  },

  updateSimDate: (daysToAdd) => {
    const nextDate = new Date(get().simDate.getTime());
    nextDate.setTime(nextDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    get().setSimDate(nextDate);
  },

  setSelectedBodyId: (id) => set((state) => {
    const nextCameraMode = id ? 'follow' : 'free';
    return { selectedBodyId: id, cameraMode: nextCameraMode };
  }),

  setHoveredBodyId: (id) => set({ hoveredBodyId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setOrbitLinesVisible: (visible) => set({ orbitLinesVisible: visible }),
  setScaleMode: (mode) => set({ scaleMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
  setShowAsteroids: (show) => set({ showAsteroids: show }),
  setUseHorizonsTelemetry: (use) => {
    set({ useHorizonsTelemetry: use });
    if (use) {
      get().fetchHorizonsForDate(get().simDate);
    } else {
      set({ planetVectors: null, horizonsError: null });
    }
  },

  fetchHorizonsForDate: async (date) => {
    // Clear any previous debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    return new Promise<void>((resolve) => {
      debounceTimeout = setTimeout(async () => {
        const dateKey = date.toISOString().split('T')[0];

        // 1. Check in-memory cache first
        if (HorizonsCache.hasAll(dateKey, BODIES_TO_FETCH)) {
          const cachedVectors = HorizonsCache.getAllForDate(dateKey);
          if (cachedVectors) {
            set({
              planetVectors: cachedVectors,
              horizonsLoading: false,
              horizonsError: null,
              lastHorizonsUpdated: new Date()
            });
            resolve();
            return;
          }
        }

        // 2. Abort previous pending fetch requests
        if (activeAbortController) {
          activeAbortController.abort();
        }
        activeAbortController = new AbortController();
        const signal = activeAbortController.signal;

        set({ horizonsLoading: true, horizonsError: null });

        try {
          // Fetch telemetry in parallel for all planets
          const fetchPromises = BODIES_TO_FETCH.map(async (bodyId) => {
            const vec = await fetchHorizonsVectors(bodyId, date, signal);
            return { bodyId, vec };
          });

          const results = await Promise.all(fetchPromises);

          // Check if thread has been aborted during network wait
          if (signal.aborted) {
            resolve();
            return;
          }

          const newVectors: Record<string, BodyVector> = {};
          results.forEach(({ bodyId, vec }) => {
            newVectors[bodyId] = vec;
            // Save to cache for quick offline lookup
            HorizonsCache.set(dateKey, bodyId, vec);
          });

          set({
            planetVectors: newVectors,
            horizonsLoading: false,
            horizonsError: null,
            lastHorizonsUpdated: new Date()
          });

        } catch (err: any) {
          // Ignore Abort errors raised from user scrubbing the timeline
          if (err.name === 'AbortError' || signal.aborted) {
            resolve();
            return;
          }

          console.error('Error fetching NASA JPL Horizons coordinates:', err);
          
          set({
            horizonsLoading: false,
            horizonsError: err.message || 'NASA JPL Horizons service is currently unavailable.'
          });
        }
        resolve();
      }, 300); // 300ms debounce
    });
  },

  resetSim: () => {
    const today = new Date();
    set({
      simDate: today,
      timeSpeed: 1,
      selectedBodyId: null,
      cameraMode: 'free',
      planetVectors: null,
      horizonsError: null,
      horizonsLoading: false
    });
    if (get().useHorizonsTelemetry) {
      get().fetchHorizonsForDate(today);
    }
  }
}));
