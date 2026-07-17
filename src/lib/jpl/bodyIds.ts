export const HORIZONS_BODY_IDS: Record<string, string> = {
  sun: '10',
  mercury: '199',
  venus: '299',
  earth: '399',
  moon: '301',
  mars: '499',
  jupiter: '599',
  saturn: '699',
  uranus: '799',
  neptune: '899',
  pluto: '999'
};

// Center body commands:
// 500@10 = Heliocentric (relative to Sun center)
// 500@399 = Geocentric (relative to Earth center)
export const HORIZONS_CENTERS: Record<string, string> = {
  default: '500@10',
  moon: '500@399' // geocentric center for Earth's moon
};
