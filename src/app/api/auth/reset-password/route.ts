import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;
    
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Token, password, and confirm password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await userService.getUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    await userService.updateUser(user.id, {
      password,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Password reset failed' },
      { status: 500 }
    );
  }
}