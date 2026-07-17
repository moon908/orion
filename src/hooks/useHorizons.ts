import { useState, useEffect } from 'react';
import { useSolarStore } from '../store/useSolarStore';
import { fetchHorizonsVectors } from '../lib/jpl/fetchHorizons';
import { BodyVector } from '../lib/jpl/types';

export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  copyright?: string;
}

export function useHorizons() {
  const nasaApiKey = useSolarStore((state) => state.nasaApiKey);
  
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Astronomy Picture of the Day as a demonstration of NASA API Integration
  useEffect(() => {
    if (!nasaApiKey || nasaApiKey === 'DEMO_KEY') return;

    const fetchApod = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`);
        if (!res.ok) throw new Error('Failed to retrieve NASA APOD');
        const data = await res.json();
        setApod(data);
      } catch (err: any) {
        setError(err.message || 'Error connecting to NASA APIs');
      } finally {
        setLoading(false);
      }
    };

    fetchApod();
  }, [nasaApiKey]);

  /**
   * Fetch orbital position vectors directly from JPL Horizons.
   * Maps straight to our unified Horizons query engine.
   */
  const fetchJplVectors = async (bodyId: string, date: Date): Promise<BodyVector | null> => {
    try {
      return await fetchHorizonsVectors(bodyId, date);
    } catch (err) {
      console.error('Horizons fetching error inside hook:', err);
      return null;
    }
  };

  /**
   * FUTURE-READY: Query Near-Earth Objects (NeoWs) for live asteroid tracking.
   * Returns list of asteroids close to Earth on a given date range.
   */
  const fetchNearEarthAsteroids = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateStr}&end_date=${dateStr}&api_key=${nasaApiKey}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('NeoWs fetching error:', err);
      return null;
    }
  };

  return {
    apod,
    loading,
    error,
    fetchJplVectors,
    fetchNearEarthAsteroids
  };
}
export default useHorizons;
