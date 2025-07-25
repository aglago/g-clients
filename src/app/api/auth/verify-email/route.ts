import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { emailService } from '@/lib/email';
import { generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp } = body;
    
    if (!otp) {
      return NextResponse.json(
        { success: false, message: 'Verification OTP is required' },
        { status: 400 }
      );
    }

    const user = await userService.verifyOTP(otp);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification OTP' },
        { status: 400 }
      );
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if email fails
    }

    // Generate JWT token for auto-login
    const token = generateJWT(user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Email verification failed' },
      { status: 500 }
    );
  }
}