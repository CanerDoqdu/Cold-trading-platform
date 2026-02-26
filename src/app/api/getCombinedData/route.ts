import { NextRequest, NextResponse } from 'next/server';
import { getCombinedData } from "@/components/NftCollectiondata";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const data = await getCombinedData(offset, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    return NextResponse.json({ error: "Error fetching combined data" }, { status: 500 });
  }
}
