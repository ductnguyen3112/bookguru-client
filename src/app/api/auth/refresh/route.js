
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Client from '@/app/model/clientModel';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
    
    // Get user
    const client = await Client.findById(decoded.id);
    if (!client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new tokens
    const tokenData = {
      id: client._id,
      clientPhone: client.clientPhone,
      clientEmail: client.clientEmail,
    };

    const newAccessToken = jwt.sign(
      tokenData,
      process.env.TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      tokenData,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}