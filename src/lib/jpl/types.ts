export interface BodyVector {
  x: number;  // Heliocentric X coordinate (in AU)
  y: number;  // Heliocentric Y coordinate (in AU)
  z: number;  // Heliocentric Z coordinate (in AU)
  vx: number; // Heliocentric velocity VX (in AU/day)
  vy: number; // Heliocentric velocity VY (in AU/day)
  vz: number; // Heliocentric velocity VZ (in AU/day)
}

export class HorizonsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'HorizonsError';
  }
}
