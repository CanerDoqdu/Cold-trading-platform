import { NextResponse } from 'next/server';
import { getRedditData } from '@/components/redditapi/redditApi';

export async function GET() {
  try {
    const posts = await getRedditData();
    
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return NextResponse.json({ error: 'Error fetching Reddit data' }, { status: 500 });
  }
}
