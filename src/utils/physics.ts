import { OrbitalElements } from '../types/solar';

const J2000_EPOCH = new Date('2000-01-01T12:00:00Z').getTime();
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Solves Kepler's Equation: E - e * sin(E) = M
 * using the Newton-Raphson method.
 */
export function solveKepler(M: number, e: number): number {
  let E = M;
  const tolerance = 1e-6;
  const maxIterations = 5;

  for (let i = 0; i < maxIterations; i++) {
    const deltaE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= deltaE;
    if (Math.abs(deltaE) < tolerance) break;
  }
  return E;
}

/**
 * Calculates the [x, y, z] position of a celestial body at a given date.
 */
export function getPlanetPosition(
  elements: OrbitalElements,
  date: Date,
  scaleMode: 'visual' | 'realistic'
): [number, number, number] {
  if (elements.orbitalPeriod === 0) {
    // The Sun stays at the origin
    return [0, 0, 0];
  }

  // Calculate elapsed days since J2000
  const elapsedDays = (date.getTime() - J2000_EPOCH) / MILLISECONDS_PER_DAY;

  // Mean anomaly M (in radians)
  // M = M0 + n * t
  // Daily motion n = (2 * Math.PI) / Period
  const n = (2 * Math.PI) / elements.orbitalPeriod;
  const M = (n * elapsedDays) % (2 * Math.PI);

  // Solve Kepler's equation for Eccentric Anomaly E (in radians)
  const E = solveKepler(M, elements.eccentricity);

  // Determine semi-major axis based on scale mode
  // visual scale: elements.semiMajorAxis
  // realistic scale: convert real AU or million km. Let's use semiMajorAxis but scaled up.
  // In realistic scale, let's map semiMajorAxis dynamically:
  // For realistic distances, let's scale relative to Earth = 11.5 visual units.
  // Actually, visual scale represents a clean spacing. Realistic scale can use the relative physical ratio.
  // Let's multiply Earth's visual distance (11.5) by the actual physical relative distance of other planets.
  // Let's define the relative distance coefficients in a lookup or calculation:
  let a = elements.semiMajorAxis;
  if (scaleMode === 'realistic') {
    // Relative distances from Sun (AU):
    // Mercury: 0.39, Venus: 0.72, Earth: 1.0, Mars: 1.52, Jupiter: 5.2, Saturn: 9.58, Uranus: 19.22, Neptune: 30.05, Pluto: 39.48
    // If Earth = 11.5, we multiply these by 11.5.
    const auScale = 11.5;
    switch (elements.orbitalPeriod) {
      case 88: // Mercury
        a = 0.39 * auScale;
        break;
      case 224.7: // Venus
        a = 0.72 * auScale;
        break;
      case 365.25: // Earth
        a = 1.0 * auScale;
        break;
      case 687: // Mars
        a = 1.52 * auScale;
        break;
      case 4333: // Jupiter
        a = 5.2 * auScale;
        break;
      case 10759: // Saturn
        a = 9.58 * auScale;
        break;
      case 30687: // Uranus
        a = 19.22 * auScale;
        break;
      case 60190: // Neptune
        a = 30.05 * auScale;
        break;
      case 90560: // Pluto
        a = 39.48 * auScale;
        break;
      default:
        a = elements.semiMajorAxis;
    }
  }

  const e = elements.eccentricity;
  const iRad = (elements.inclination * Math.PI) / 180;

  // Position in the orbital plane (Keplerian)
  const xPrime = a * (Math.cos(E) - e);
  const zPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Rotate to account for inclination (tilted around X axis)
  const x = xPrime;
  const y = zPrime * Math.sin(iRad);
  const z = zPrime * Math.cos(iRad);

  return [x, y, z];
}

/**
 * Generates an array of [x, y, z] points forming the orbital ellipse path.
 */
export function getOrbitPath(
  elements: OrbitalElements,
  scaleMode: 'visual' | 'realistic',
  segments = 128
): [number, number, number][] {
  if (elements.orbitalPeriod === 0) return [];

  const points: [number, number, number][] = [];
  const e = elements.eccentricity;
  const iRad = (elements.inclination * Math.PI) / 180;

  let a = elements.semiMajorAxis;
  if (scaleMode === 'realistic') {
    const auScale = 11.5;
    switch (elements.orbitalPeriod) {
      case 88: a = 0.39 * auScale; break;
      case 224.7: a = 0.72 * auScale; break;
      case 365.25: a = 1.0 * auScale; break;
      case 687: a = 1.52 * auScale; break;
      case 4333: a = 5.2 * auScale; break;
      case 10759: a = 9.58 * auScale; break;
      case 30687: a = 19.22 * auScale; break;
      case 60190: a = 30.05 * auScale; break;
      case 90560: a = 39.48 * auScale; break;
      default: a = elements.semiMajorAxis;
    }
  }

  for (let j = 0; j <= segments; j++) {
    // Eccentric anomaly E from 0 to 2*PI
    const E = (j / segments) * 2 * Math.PI;

    // Coordinate in orbit plane
    const xPrime = a * (Math.cos(E) - e);
    const zPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Coordinate rotated by inclination
    const x = xPrime;
    const y = zPrime * Math.sin(iRad);
    const z = zPrime * Math.cos(iRad);

    points.push([x, y, z]);
  }

  return points;
}
