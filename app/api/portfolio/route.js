import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/models/portfolioModel";
import { addHoldingSchema, updateHoldingSchema, deleteHoldingSchema } from "@/lib/schemas";

// Helper: Get user ID from token
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    return decoded._id;
  } catch {
    return null;
  }
}

// GET - Fetch user's portfolio
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    let portfolio = await Portfolio.findOne({ userId });
    
    // If no portfolio exists, create an empty one
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, holdings: [] });
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

// POST - Add a new holding
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addHoldingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { coinId, symbol, name, amount, buyPrice, buyDate, notes } = parsed.data;

    await dbConnect();

    let portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({ userId, holdings: [] });
    }

    portfolio.holdings.push({
      coinId,
      symbol,
      name,
      amount,
      buyPrice,
      buyDate: buyDate ? new Date(buyDate) : new Date(),
      notes: notes || "",
    });

    await portfolio.save();

    return NextResponse.json({ portfolio, message: "Holding added successfully" });
  } catch (error) {
    console.error("Portfolio add error:", error);
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
  }
}

// DELETE - Remove a holding
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteHoldingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { holdingId } = parsed.data;

    await dbConnect();

    const portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    portfolio.holdings = portfolio.holdings.filter(
      (h) => h._id.toString() !== holdingId
    );

    await portfolio.save();

    return NextResponse.json({ portfolio, message: "Holding removed successfully" });
  } catch (error) {
    console.error("Portfolio delete error:", error);
    return NextResponse.json({ error: "Failed to remove holding" }, { status: 500 });
  }
}

// PUT - Update a holding
export async function PUT(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateHoldingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { holdingId, amount, buyPrice, notes } = parsed.data;
    const { buyDate } = body;

    await dbConnect();

    const portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const holding = portfolio.holdings.id(holdingId);
    
    if (!holding) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    if (amount !== undefined) holding.amount = amount;
    if (buyPrice !== undefined) holding.buyPrice = buyPrice;
    if (buyDate !== undefined) holding.buyDate = new Date(buyDate);
    if (notes !== undefined) holding.notes = notes;

    await portfolio.save();

    return NextResponse.json({ portfolio, message: "Holding updated successfully" });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json({ error: "Failed to update holding" }, { status: 500 });
  }
}
