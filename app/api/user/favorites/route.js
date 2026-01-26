import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Get user's favorites
export async function GET(request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const user = await User.findById(decoded._id).select('favorites');
    if (!user) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    // Update last activity
    await User.findByIdAndUpdate(decoded._id, { lastActivity: new Date() });

    return NextResponse.json({ favorites: user.favorites || [] }, { status: 200 });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Add or remove a favorite
export async function POST(request) {
  try {
    await dbConnect();

    const { coinId, action } = await request.json();

    if (!coinId) {
      return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize favorites array if not exists
    if (!user.favorites) {
      user.favorites = [];
    }

    if (action === 'add') {
      // Add to favorites if not already there
      if (!user.favorites.includes(coinId)) {
        user.favorites.push(coinId);
      }
    } else if (action === 'remove') {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id !== coinId);
    } else {
      // Toggle
      if (user.favorites.includes(coinId)) {
        user.favorites = user.favorites.filter(id => id !== coinId);
      } else {
        user.favorites.push(coinId);
      }
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    return NextResponse.json({ 
      favorites: user.favorites,
      isFavorite: user.favorites.includes(coinId)
    }, { status: 200 });
  } catch (error) {
    console.error('Update favorites error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
