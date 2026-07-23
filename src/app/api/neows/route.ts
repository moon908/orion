import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side Proxy for NASA Near-Earth Objects (NeoWs) feed.
 * Avoids CORS errors, bypasses client-side DNS/adblock filters, 
 * and secures the private API key on the backend.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '';

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required.' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY';
  const targetUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'OrionSpaceEngine/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `NASA NeoWs API returned status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('NeoWs proxy error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch asteroid telemetry from NASA.' },
      { status: 500 }
    );
  }
}
