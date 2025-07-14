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
        { success: true, message: 'If an account with that email exists, a verification email has been sent.' },
        { status: 200 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      );
    }

    const verificationToken = generateToken();

    await userService.updateUser(user.id, {
      verificationToken
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}