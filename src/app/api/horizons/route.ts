import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { parseHorizonsResponse } from '../../../lib/jpl/parseHorizons';

/**
 * Server-side Horizons API proxy that caches fetched vector states 
 * persistently inside NeonDB.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 1. Clean query parameters (strip JPL single quotes)
  const rawCommand = searchParams.get('COMMAND') || '';
  const rawDate = searchParams.get('START_TIME') || '';

  const command = rawCommand.replace(/'/g, '').trim();
  const dateKey = rawDate.replace(/'/g, '').trim();

  const isDbConfigured = !!process.env.DATABASE_URL;

  // 2. Attempt database lookup (CORS-safe persistent caching)
  if (isDbConfigured && command && dateKey) {
    try {
      const cached = await prisma.horizonsCache.findUnique({
        where: {
          dateKey_bodyId: {
            dateKey,
            bodyId: command,
          },
        },
      });

      if (cached) {
        // Reconstruct the text block format to match parseHorizonsResponse expectation
        const reconstructedResult = `
          $$SOE
          2460000.500000000 = A.D. ${dateKey} 00:00:00.0000 TDB
          X = ${cached.x} Y = ${cached.y} Z = ${cached.z}
          VX= ${cached.vx} VY= ${cached.vy} VZ= ${cached.vz}
          $$EOE
        `;
        return NextResponse.json({ result: reconstructedResult });
      }
    } catch (dbErr) {
      console.warn('NeonDB lookup failed, falling back directly to NASA API:', dbErr);
    }
  }

  // 3. Database miss: Forward request to NASA JPL Horizons REST API
  const targetUrl = new URL('https://ssd-api.jpl.nasa.gov/horizons.api');
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'OrionSpaceEngine/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `NASA Horizons returned error code: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const resultStr = data.result;

    if (!resultStr) {
      return NextResponse.json(data);
    }

    // 4. Parse coordinates and write to database cache in background
    if (isDbConfigured && command && dateKey) {
      try {
        const parsed = parseHorizonsResponse(resultStr);
        
        // Upsert to ensure we don't trigger duplicate keys on concurrent mounts
        await prisma.horizonsCache.upsert({
          where: {
            dateKey_bodyId: {
              dateKey,
              bodyId: command,
            },
          },
          create: {
            dateKey,
            bodyId: command,
            x: parsed.x,
            y: parsed.y,
            z: parsed.z,
            vx: parsed.vx,
            vy: parsed.vy,
            vz: parsed.vz,
          },
          update: {
            x: parsed.x,
            y: parsed.y,
            z: parsed.z,
            vx: parsed.vx,
            vy: parsed.vy,
            vz: parsed.vz,
          },
        });
      } catch (dbWriteErr) {
        console.warn('Failed to cache Horizons vectors in NeonDB:', dbWriteErr);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Horizons API Proxy Error:', err);
    return NextResponse.json(
      { error: err.message || 'Unable to fetch coordinate vectors from NASA.' },
      { status: 500 }
    );
  }
}
