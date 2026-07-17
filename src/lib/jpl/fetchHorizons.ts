import { BodyVector, HorizonsError } from './types';
import { parseHorizonsResponse } from './parseHorizons';
import { HORIZONS_BODY_IDS, HORIZONS_CENTERS } from './bodyIds';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

/**
 * Formats a Date object to YYYY-MM-DD in UTC to prevent timezone offset discrepancies.
 */
export function formatDateUTC(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Queries the NASA JPL Horizons REST API to fetch orbital state vectors.
 * Supports abort signals, automatic retries with exponential backoff, and 10-second timeouts.
 */
export async function fetchHorizonsVectors(
  bodyId: string,
  date: Date,
  parentSignal?: AbortSignal
): Promise<BodyVector> {
  // Optimization: The Sun is the center coordinate origin in our simulation
  if (bodyId === 'sun') {
    return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 };
  }

  const horizonsId = HORIZONS_BODY_IDS[bodyId];
  if (!horizonsId) {
    throw new HorizonsError(`Unknown celestial body ID: ${bodyId}`, 'UNKNOWN_BODY');
  }

  const center = bodyId === 'moon' ? HORIZONS_CENTERS.moon : HORIZONS_CENTERS.default;
  const startStr = formatDateUTC(date);
  // Fetch stop time as next day to get a 1-day vector row
  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const stopStr = formatDateUTC(tomorrow);

  // Construct URL
  const queryParams = new URLSearchParams({
    format: 'json',
    COMMAND: `'${horizonsId}'`,
    CENTER: `'${center}'`,
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    OUT_UNITS: 'AU-D', // AU and AU/day
    START_TIME: `'${startStr}'`,
    STOP_TIME: `'${stopStr}'`,
    STEP_SIZE: '1d',
    OBJ_DATA: 'NO'
  });

  const url = `/api/horizons?${queryParams.toString()}`;

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    // Set up AbortController for linking parent signal and 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let listener: (() => void) | null = null;
    if (parentSignal) {
      if (parentSignal.aborted) {
        clearTimeout(timeoutId);
        throw new DOMException('Aborted', 'AbortError');
      }
      listener = () => controller.abort();
      parentSignal.addEventListener('abort', listener);
    }

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (parentSignal && listener) {
        parentSignal.removeEventListener('abort', listener);
      }

      if (!response.ok) {
        throw new HorizonsError(
          `JPL HTTP error: status ${response.status}`,
          'HTTP_ERROR'
        );
      }

      const json = await response.json();
      if (json.error) {
        throw new HorizonsError(
          `JPL Horizons API returned error: ${json.error}`,
          'API_ERROR'
        );
      }

      const resultStr = json.result;
      if (!resultStr) {
        throw new HorizonsError(
          'JPL Horizons payload is missing the result field',
          'MISSING_RESULT'
        );
      }

      // Parse the output string and return coordinates
      return parseHorizonsResponse(resultStr);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal && listener) {
        parentSignal.removeEventListener('abort', listener);
      }

      const isAbort = err.name === 'AbortError' || err instanceof DOMException;
      
      // If manually aborted by the parent component (e.g. date changed again), don't retry
      if (isAbort && parentSignal?.aborted) {
        throw err;
      }

      attempt++;
      if (attempt >= MAX_RETRIES) {
        const errCode = isAbort ? 'TIMEOUT' : 'FETCH_FAILED';
        const errMsg = isAbort
          ? 'NASA JPL Horizons connection timed out after 10 seconds'
          : err.message || 'Horizons connection failed';
        throw new HorizonsError(errMsg, errCode);
      }

      // Exponential backoff delay: 800ms, 1600ms, 3200ms
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new HorizonsError('JPL Horizons fetch failed after max retries', 'RETRY_LIMIT_EXCEEDED');
}
