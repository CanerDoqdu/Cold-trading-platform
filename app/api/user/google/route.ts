import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Type for User model with custom static methods
interface UserModel {
  googleAuth: (googleId: string, email: string, name: string) => Promise<any>;
  findOne: (query: any) => Promise<any>;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create JWT token
const createToken = (userId: string) => {
  return jwt.sign({ _id: userId }, process.env.SECRET!, { expiresIn: '3d' });
};

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();
    
    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Find or create user
    const user = await (User as unknown as UserModel).googleAuth(googleId, email, name || email.split('@')[0]);

    // Create session token
    const token = createToken(user._id.toString());

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60, // 3 days
      path: '/',
    });

    return NextResponse.json({
      email: user.email,
      name: user.name,
      _id: user._id,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
