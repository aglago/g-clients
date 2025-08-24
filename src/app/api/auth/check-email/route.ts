import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await userService.getUserByEmail(email);

    return NextResponse.json({
      exists: !!existingUser,
      user: existingUser ? {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      } : null
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    );
  }
}