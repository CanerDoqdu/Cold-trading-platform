import { NextRequest, NextResponse } from 'next/server';
import { getCollectionItems } from '@/lib/openSeaUtils';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const slug = search.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  try {
    const description = await getCollectionItems(slug);
    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error fetching description:', error);
    return NextResponse.json(
      { error: 'Error fetching description.' },
      { status: 500 },
    );
  }
}
