import { BodyVector } from './types';

// In-memory cache: Map<DateKey (YYYY-MM-DD), Map<BodyId, BodyVector>>
const cacheMap = new Map<string, Map<string, BodyVector>>();

export const HorizonsCache = {
  /**
   * Retrieves a cached vector for a specific body and date key.
   */
  get(dateKey: string, bodyId: string): BodyVector | null {
    const dayMap = cacheMap.get(dateKey);
    if (!dayMap) return null;
    return dayMap.get(bodyId) || null;
  },

  /**
   * Caches a vector for a specific body and date key.
   */
  set(dateKey: string, bodyId: string, vector: BodyVector): void {
    let dayMap = cacheMap.get(dateKey);
    if (!dayMap) {
      dayMap = new Map<string, BodyVector>();
      cacheMap.set(dateKey, dayMap);
    }
    dayMap.set(bodyId, vector);
  },

  /**
   * Checks if all requested body IDs are cached for a specific date key.
   */
  hasAll(dateKey: string, bodyIds: string[]): boolean {
    const dayMap = cacheMap.get(dateKey);
    if (!dayMap) return false;
    return bodyIds.every((id) => dayMap.has(id));
  },

  /**
   * Retrieves all cached vectors for a specific date key.
   */
  getAllForDate(dateKey: string): Record<string, BodyVector> | null {
    const dayMap = cacheMap.get(dateKey);
    if (!dayMap) return null;
    
    const result: Record<string, BodyVector> = {};
    dayMap.forEach((vector, bodyId) => {
      result[bodyId] = vector;
    });
    return result;
  },

  /**
   * Clears the cache.
   */
  clear(): void {
    cacheMap.clear();
  }
};
