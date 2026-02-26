import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  const vs_currencies = searchParams.get("vs_currencies") || "usd";

  if (!ids) {
    return NextResponse.json({ error: "Missing coin IDs" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`,
      {
        headers: {
          accept: "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!res.ok) {
      throw new Error("CoinGecko API error");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Simple price fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
