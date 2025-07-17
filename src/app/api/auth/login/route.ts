import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { verifyPassword, generateJWT } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await userService.getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      // Auto-generate and send OTP for unverified users
      try {
        const otp = await userService.generateAndSetOTP(user.id);
        await emailService.sendVerificationEmail(user.email, otp, user.firstName);
        
        return NextResponse.json({
          success: false,
          message: 'Email not verified. We\'ve sent a verification code to your email.',
          requiresVerification: true,
          email: user.email
        }, { status: 401 });
      } catch (otpError) {
        console.error('Error sending verification OTP:', otpError);
        return NextResponse.json(
          { success: false, message: 'Please verify your email before logging in' },
          { status: 401 }
        );
      }
    }

    const token = generateJWT(user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}