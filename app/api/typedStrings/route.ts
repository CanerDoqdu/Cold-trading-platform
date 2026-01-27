// app/api/typedStrings/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Static strings - no need to fetch
  const strings = ["Fast.", "Secure.", "Simple."];
  
  return NextResponse.json(strings, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
