import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { generateToken } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await userService.updateUser(user.id, {
      resetToken,
      resetTokenExpiry
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName, user.role);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
      { success: false, message: 'Failed to send password reset email. Try again.' },
      { status: 500 }
    );
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing forgot password request' },
      { status: 500 }
    );
  }
}