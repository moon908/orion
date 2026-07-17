export interface MoonData {
  id: string;
  name: string;
  radius: number; // in km
  orbitalPeriod: number; // in Earth days
  distanceFromPlanet: number; // in thousands of km
  color: string;
}

export interface AtmosphereData {
  composition: string[];
  pressure: string;
  description: string;
}

export interface OrbitalElements {
  semiMajorAxis: number; // a, relative visual scale
  eccentricity: number; // e
  inclination: number; // i, degrees
  orbitalPeriod: number; // T, in Earth days
  rotationPeriod: number; // in hours (negative for retrograde)
  obliquity: number; // tilt of rotation axis, degrees
}

export interface SaturnRingData {
  innerRadius: number;
  outerRadius: number;
  color: string;
  texturePattern: string; // procedural id
}

export interface CelestialBodyData {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'dwarf';
  radius: number; // in km
  mass: string; // in kg
  gravity: number; // in m/s^2
  diameter: number; // in km
  distanceFromSun: number; // in million km
  orbitalPeriod: number; // in Earth days
  rotationPeriod: number; // in hours
  moonsCount: number;
  moons?: MoonData[];
  temperature: string; // e.g. "-100°C to 15°C"
  atmosphere: AtmosphereData;
  interestingFacts: string[];
  orbitalElements: OrbitalElements;
  color: string;
  emissiveColor?: string;
  ring?: SaturnRingData;
}
