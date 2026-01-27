import { NextResponse } from 'next/server';
import { getCollectionsData, getStatsData } from '@/components/NftCollectiondata';

export async function GET() {
  try {
    const collections = await getCollectionsData(0, 3);
    const first = collections?.[0];
    const id = (first?.slug as string) || (first?.name as string);
    let stats: any = null;
    if (id) {
      try {
        stats = await getStatsData(id);
      } catch (e) {
        stats = { error: String(e) };
      }
    }

    return NextResponse.json({
      envHasKey: !!process.env.OPENSEA_API_KEY,
      collectionsCount: collections?.length || 0,
      sampleCollection: first || null,
      stats,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
