import { CelestialBodyData } from '../types/solar';

export const CELESTIAL_BODIES: CelestialBodyData[] = [
  {
    id: 'sun',
    name: 'Sun',
    type: 'star',
    radius: 696340,
    mass: '1.989 × 10^30',
    gravity: 274,
    diameter: 1392700,
    distanceFromSun: 0,
    orbitalPeriod: 0,
    rotationPeriod: 609.6,
    moonsCount: 0,
    temperature: '5,500°C (Surface) to 15,000,000°C (Core)',
    atmosphere: {
      composition: ['Hydrogen (73%)', 'Helium (25%)', 'Oxygen', 'Carbon', 'Neon', 'Iron'],
      pressure: 'Extremely high (10^11 bar)',
      description: 'The Sun\'s atmosphere consists of the photosphere, chromosphere, and the corona, which releases the solar wind.'
    },
    interestingFacts: [
      'The Sun accounts for 99.86% of the mass in the entire Solar System.',
      'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
      'Over one million Earths could fit inside the Sun.'
    ],
    orbitalElements: {
      semiMajorAxis: 0,
      eccentricity: 0,
      inclination: 0,
      orbitalPeriod: 0,
      rotationPeriod: 609.6,
      obliquity: 7.25
    },
    color: '#FFB800',
    emissiveColor: '#FFA500'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    radius: 2439.7,
    mass: '3.285 × 10^23',
    gravity: 3.7,
    diameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    moonsCount: 0,
    temperature: '-180°C to 430°C',
    atmosphere: {
      composition: ['Oxygen', 'Sodium', 'Hydrogen', 'Helium', 'Potassium'],
      pressure: '10^-14 bar (Negligible)',
      description: 'Mercury has a thin exosphere rather than a stable atmosphere, constantly blown away by solar winds.'
    },
    interestingFacts: [
      'Mercury is the smallest planet and closest to the Sun.',
      'A year on Mercury is just 88 Earth days, but a single day-night cycle takes 176 Earth days.',
      'Despite being closest to the Sun, it is not the hottest planet (Venus is).'
    ],
    orbitalElements: {
      semiMajorAxis: 5.5,
      eccentricity: 0.2056,
      inclination: 7.0,
      orbitalPeriod: 88,
      rotationPeriod: 1407.6,
      obliquity: 0.034
    },
    color: '#8A8D8F'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    radius: 6051.8,
    mass: '4.867 × 10^24',
    gravity: 8.87,
    diameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5,
    moonsCount: 0,
    temperature: '462°C',
    atmosphere: {
      composition: ['Carbon Dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfur Dioxide', 'Argon'],
      pressure: '92 bar',
      description: 'Venus has an extremely dense, toxic atmosphere that creates a runaway greenhouse effect.'
    },
    interestingFacts: [
      'Venus is the hottest planet in the Solar System, with surface temperatures hot enough to melt lead.',
      'It rotates backward on its axis (retrograde), meaning the Sun rises in the west and sets in the east.',
      'Venus is the brightest natural object in Earth\'s night sky after the Moon.'
    ],
    orbitalElements: {
      semiMajorAxis: 8.0,
      eccentricity: 0.0067,
      inclination: 3.39,
      orbitalPeriod: 224.7,
      rotationPeriod: -5832.5,
      obliquity: 177.3
    },
    color: '#E3BB76'
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    radius: 6371.0,
    mass: '5.972 × 10^24',
    gravity: 9.81,
    diameter: 12742,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    moonsCount: 1,
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        radius: 1737.4,
        orbitalPeriod: 27.3,
        distanceFromPlanet: 0.384,
        color: '#D1D5DB'
      }
    ],
    temperature: '-89°C to 58°C',
    atmosphere: {
      composition: ['Nitrogen (78.1%)', 'Oxygen (20.9%)', 'Argon (0.9%)', 'Carbon Dioxide (0.04%)'],
      pressure: '1.013 bar',
      description: 'Earth has a life-supporting nitrogen-oxygen atmosphere shielded by a magnetic field.'
    },
    interestingFacts: [
      'Earth is the only planet in the universe known to harbor life.',
      'About 71% of Earth\'s surface is covered by water.',
      'It is the densest planet in the Solar System.'
    ],
    orbitalElements: {
      semiMajorAxis: 11.5,
      eccentricity: 0.0167,
      inclination: 0.0,
      orbitalPeriod: 365.25,
      rotationPeriod: 24,
      obliquity: 23.44
    },
    color: '#2B82C9'
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    radius: 3389.5,
    mass: '6.417 × 10^23',
    gravity: 3.71,
    diameter: 6779,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    moonsCount: 2,
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        radius: 11.2,
        orbitalPeriod: 0.3,
        distanceFromPlanet: 0.009,
        color: '#A1A1AA'
      },
      {
        id: 'deimos',
        name: 'Deimos',
        radius: 6.2,
        orbitalPeriod: 1.26,
        distanceFromPlanet: 0.023,
        color: '#8E9196'
      }
    ],
    temperature: '-143°C to 35°C',
    atmosphere: {
      composition: ['Carbon Dioxide (95.3%)', 'Nitrogen (2.7%)', 'Argon (1.6%)', 'Oxygen', 'Water Vapor'],
      pressure: '0.006 bar (Very Thin)',
      description: 'Mars has a thin, dry atmosphere that cannot easily trap heat, causing massive temperature drops.'
    },
    interestingFacts: [
      'Mars is known as the "Red Planet" due to iron oxide (rust) on its surface.',
      'It is home to Olympus Mons, the largest volcano in the Solar System, which is 3 times taller than Mt. Everest.',
      'Liquid water cannot exist on the surface of Mars for long due to low atmospheric pressure.'
    ],
    orbitalElements: {
      semiMajorAxis: 15.0,
      eccentricity: 0.0934,
      inclination: 1.85,
      orbitalPeriod: 687,
      rotationPeriod: 24.6,
      obliquity: 25.19
    },
    color: '#D15C3D'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    radius: 69911,
    mass: '1.898 × 10^27',
    gravity: 24.79,
    diameter: 139820,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    moonsCount: 95,
    moons: [
      { id: 'io', name: 'Io', radius: 1821.6, orbitalPeriod: 1.77, distanceFromPlanet: 0.422, color: '#EAB308' },
      { id: 'europa', name: 'Europa', radius: 1560.8, orbitalPeriod: 3.55, distanceFromPlanet: 0.671, color: '#93C5FD' },
      { id: 'ganymede', name: 'Ganymede', radius: 2634.1, orbitalPeriod: 7.15, distanceFromPlanet: 1.07, color: '#A3A3A3' },
      { id: 'callisto', name: 'Callisto', radius: 2410.3, orbitalPeriod: 16.69, distanceFromPlanet: 1.882, color: '#78716C' }
    ],
    temperature: '-108°C',
    atmosphere: {
      composition: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane', 'Ammonia'],
      pressure: 'Extremely high deep inside',
      description: 'Jupiter is a gas giant with no solid surface. Its atmosphere features turbulent clouds, including the Great Red Spot.'
    },
    interestingFacts: [
      'Jupiter is more than twice as massive as all the other planets in the Solar System combined.',
      'The Great Red Spot is a giant storm larger than Earth that has raged for hundreds of years.',
      'It has the shortest day of all the planets, spinning once every 9.9 hours.'
    ],
    orbitalElements: {
      semiMajorAxis: 21.0,
      eccentricity: 0.0489,
      inclination: 1.3,
      orbitalPeriod: 4333,
      rotationPeriod: 9.9,
      obliquity: 3.13
    },
    color: '#CCA37A'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    radius: 58232,
    mass: '5.683 × 10^26',
    gravity: 10.44,
    diameter: 116460,
    distanceFromSun: 1434,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    moonsCount: 146,
    moons: [
      { id: 'titan', name: 'Titan', radius: 2574.7, orbitalPeriod: 15.95, distanceFromPlanet: 1.222, color: '#FBBF24' },
      { id: 'enceladus', name: 'Enceladus', radius: 252.1, orbitalPeriod: 1.37, distanceFromPlanet: 0.238, color: '#E2E8F0' },
      { id: 'mimas', name: 'Mimas', radius: 198.2, orbitalPeriod: 0.94, distanceFromPlanet: 0.185, color: '#CBD5E1' }
    ],
    temperature: '-139°C',
    atmosphere: {
      composition: ['Hydrogen (96.3%)', 'Helium (3.2%)', 'Methane', 'Ammonia'],
      pressure: 'Extremely high deep inside',
      description: 'Saturn\'s upper atmosphere is cold and banded. Wind speeds in Saturn\'s atmosphere can reach 1,800 km/h.'
    },
    interestingFacts: [
      'Saturn has the most spectacular ring system, made of ice particles, rocky debris, and dust.',
      'It is the least dense planet; if there were a bathtub big enough, Saturn would float in water.',
      'Its largest moon, Titan, is the only moon in the Solar System with a dense atmosphere and liquid methane lakes.'
    ],
    orbitalElements: {
      semiMajorAxis: 27.5,
      eccentricity: 0.0565,
      inclination: 2.49,
      orbitalPeriod: 10759,
      rotationPeriod: 10.7,
      obliquity: 26.73
    },
    ring: {
      innerRadius: 1.3, // multipliers of planet visual radius
      outerRadius: 2.4,
      color: '#E0C89F',
      texturePattern: 'saturn_rings'
    },
    color: '#E2C799'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    radius: 25362,
    mass: '8.681 × 10^25',
    gravity: 8.69,
    diameter: 50724,
    distanceFromSun: 2871,
    orbitalPeriod: 30687,
    rotationPeriod: -17.2,
    moonsCount: 28,
    moons: [
      { id: 'titania', name: 'Titania', radius: 788.4, orbitalPeriod: 8.71, distanceFromPlanet: 0.436, color: '#CBD5E1' },
      { id: 'oberon', name: 'Oberon', radius: 761.4, orbitalPeriod: 13.46, distanceFromPlanet: 0.584, color: '#94A3B8' }
    ],
    temperature: '-197°C',
    atmosphere: {
      composition: ['Hydrogen (82.5%)', 'Helium (15.2%)', 'Methane (2.3%)'],
      pressure: 'High pressure deep inside',
      description: 'Uranus has a cold, methane-rich atmosphere that absorbs red light, giving it a pale cyan hue.'
    },
    interestingFacts: [
      'Uranus is uniquely tilted on its side (97.77°), making it roll around the Sun like a ball.',
      'It is an "ice giant" with a rocky core surrounded by an icy mantle.',
      'It was the first planet discovered using a telescope (by William Herschel in 1781).'
    ],
    orbitalElements: {
      semiMajorAxis: 34.0,
      eccentricity: 0.0472,
      inclination: 0.77,
      orbitalPeriod: 30687,
      rotationPeriod: -17.2,
      obliquity: 97.77
    },
    ring: {
      innerRadius: 1.4,
      outerRadius: 1.8,
      color: '#A5F3FC',
      texturePattern: 'uranus_rings'
    },
    color: '#BFE4E5'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    radius: 24622,
    mass: '1.024 × 10^26',
    gravity: 11.15,
    diameter: 49244,
    distanceFromSun: 4495,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    moonsCount: 16,
    moons: [
      { id: 'triton', name: 'Triton', radius: 1353.4, orbitalPeriod: -5.88, distanceFromPlanet: 0.354, color: '#E2E8F0' }
    ],
    temperature: '-201°C',
    atmosphere: {
      composition: ['Hydrogen (80.0%)', 'Helium (19.0%)', 'Methane (1.5%)'],
      pressure: 'Very High',
      description: 'Neptune\'s atmosphere is dynamic, with fast winds (up to 2,100 km/h) and dark storm systems.'
    },
    interestingFacts: [
      'Neptune is the most distant planet in our Solar System.',
      'It was predicted mathematically before it was visually observed in 1846.',
      'Its moon Triton orbits Neptune backward (retrograde orbit), showing it was likely captured by Neptune\'s gravity.'
    ],
    orbitalElements: {
      semiMajorAxis: 40.0,
      eccentricity: 0.0086,
      inclination: 1.77,
      orbitalPeriod: 60190,
      rotationPeriod: 16.1,
      obliquity: 28.32
    },
    color: '#3B82F6'
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf',
    radius: 1188.3,
    mass: '1.303 × 10^22',
    gravity: 0.62,
    diameter: 2376,
    distanceFromSun: 5906,
    orbitalPeriod: 90560,
    rotationPeriod: -153.3,
    moonsCount: 5,
    moons: [
      { id: 'charon', name: 'Charon', radius: 606, orbitalPeriod: 6.38, distanceFromPlanet: 0.019, color: '#94A3B8' }
    ],
    temperature: '-225°C',
    atmosphere: {
      composition: ['Nitrogen', 'Methane', 'Carbon Monoxide'],
      pressure: '10 microbar (Highly variable)',
      description: 'Pluto has a thin, temporary atmosphere that expands when closer to the Sun and freezes/collapses when farther away.'
    },
    interestingFacts: [
      'Pluto was reclassified from a planet to a "dwarf planet" in 2006 by the IAU.',
      'It has a giant, heart-shaped glacier named Tombaugh Regio made of nitrogen and methane ice.',
      'Pluto\'s orbit is highly eccentric and inclined, sometimes bringing it closer to the Sun than Neptune.'
    ],
    orbitalElements: {
      semiMajorAxis: 46.0,
      eccentricity: 0.2488,
      inclination: 17.16,
      orbitalPeriod: 90560,
      rotationPeriod: -153.3,
      obliquity: 122.53
    },
    color: '#C0B3A3'
  }
];
