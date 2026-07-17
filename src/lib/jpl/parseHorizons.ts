import { BodyVector, HorizonsError } from './types';

/**
 * Parses the raw text output from the NASA JPL Horizons API.
 * Extracts the 3D position (X, Y, Z in AU) and velocity (VX, VY, VZ in AU/day)
 * vectors located between $$SOE and $$EOE markers.
 */
export function parseHorizonsResponse(responseStr: string): BodyVector {
  const soeIndex = responseStr.indexOf('$$SOE');
  const eoeIndex = responseStr.indexOf('$$EOE');

  if (soeIndex === -1 || eoeIndex === -1) {
    throw new HorizonsError(
      'Invalid JPL Horizons payload: $$SOE or $$EOE markers missing',
      'INVALID_PAYLOAD'
    );
  }

  // Extract the raw text block between the markers
  const dataBlock = responseStr.substring(soeIndex + 5, eoeIndex);

  // Regex matches coordinate numbers, supporting signs, decimals, and scientific E/D notation:
  // e.g. "X = -1.2345E-01" or "Y = 3.456D+00"
  const posRegex = /X\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)\s*Y\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)\s*Z\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)/i;
  const velRegex = /VX\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)\s*VY\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)\s*VZ\s*=\s*([-+]?[0-9]*\.?[0-9]+(?:[eEdD][-+]?[0-9]+)?)/i;

  const posMatch = dataBlock.match(posRegex);
  const velMatch = dataBlock.match(velRegex);

  if (!posMatch || !velMatch) {
    throw new HorizonsError(
      'Failed to parse X, Y, Z coordinates or velocity vectors from the Horizons output',
      'PARSING_ERROR'
    );
  }

  // Clean Fortran exponent "D" or "d" and parse float
  const parseFloatClean = (valStr: string): number => {
    const cleanStr = valStr.replace(/[dD]/g, 'e');
    const num = parseFloat(cleanStr);
    if (isNaN(num)) {
      throw new HorizonsError(`Parsed NaN coordinate value from: ${valStr}`, 'PARSE_NAN');
    }
    return num;
  };

  return {
    x: parseFloatClean(posMatch[1]),
    y: parseFloatClean(posMatch[2]),
    z: parseFloatClean(posMatch[3]),
    vx: parseFloatClean(velMatch[1]),
    vy: parseFloatClean(velMatch[2]),
    vz: parseFloatClean(velMatch[3])
  };
}
export default parseHorizonsResponse;
