import { NextRequest, NextResponse } from 'next/server';
import { trackService, userService, invoiceService, enrollmentService } from '@/lib/services';
import { sendEmail } from '@/lib/email';
import { generateJWT } from '@/lib/auth';

interface CheckoutData {
  trackSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  password: string;
  paymentSuccess: boolean;
  paymentDetails?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const data: CheckoutData = await request.json();
    
    const {
      trackSlug,
      firstName,
      lastName,
      email,
      phone,
      gender,
      location,
      password,
      paymentSuccess,
      paymentDetails
    } = data;

    // Validate required fields
    if (!trackSlug || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get track details
    const track = await trackService.getTrackBySlug(trackSlug);
    if (!track) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    let user = await userService.getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user account
      isNewUser = true;
      user = await userService.createUser({
        firstName,
        lastName,
        email,
        password, // Raw password - userService will hash it
        role: 'learner',
        contact: phone,
        isVerified: true, // Auto-verify since they're enrolling
        // Additional learner fields
        gender,
        location,
        bio: `Learning ${track.name}`,
      });
    } else {
      // User exists - for security, reject unauthenticated checkout
      // This prevents unauthorized charges to existing accounts
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email already exists. Please login to continue with checkout.',
          existingUser: true,
          requiresAuthentication: true
        },
        { status: 403 } // Forbidden - authentication required
      );
    }

    try {
      // Check if user is already enrolled in this track
      const existingEnrollment = await enrollmentService.getEnrollmentByUserAndTrack(
        user.id, 
        track.id
      );
      
      if (existingEnrollment) {
        return NextResponse.json(
          { success: false, message: 'You are already enrolled in this track.' },
          { status: 409 }
        );
      }

      if (paymentSuccess) {
        // Payment successful - create enrollment and paid invoice
        
        // 1. Create track enrollment record
        await enrollmentService.createTrackEnrollment({
          trackId: track.id,
          learnerId: user.id,
          status: 'active',
          progress: 0
        });

        // 2. Create paid invoice record
        const invoice = await invoiceService.createInvoice({
          learnerId: user.id,
          trackId: track.id,
          amount: track.price,
          dueDate: new Date().toISOString(), // Paid immediately
          paymentDetails: JSON.stringify(paymentDetails || {}),
          status: 'paid',
        });

        // 3. Send appropriate email
        if (isNewUser) {
          await sendWelcomeEmail({
            email,
            firstName,
            trackName: track.name,
            loginEmail: email,
          });
        } else {
          await sendEnrollmentConfirmationEmail({
            email,
            firstName: user.firstName,
            trackName: track.name,
          });
        }

        // Generate JWT token for auto-login
        const token = generateJWT(user.id);

        return NextResponse.json({
          success: true,
          message: isNewUser ? 'Account created and enrollment successful' : 'Enrollment successful',
          autoLogin: true, // Flag to indicate auto-login should happen
          token, // JWT token for auto-login
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          invoiceId: invoice.id,
        });
      } else {
        // Payment failed - create unpaid invoice (no enrollment yet)
        const invoice = await invoiceService.createInvoice({
          learnerId: user.id,
          trackId: track.id,
          amount: track.price,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          paymentDetails: JSON.stringify(paymentDetails || {}),
          status: 'unpaid',
        });

        // Send email about pending payment
        if (isNewUser) {
          await sendPendingPaymentEmail({
            email,
            firstName,
            trackName: track.name,
            amount: track.price,
            invoiceId: invoice.id,
          });
        } else {
          await sendPaymentFailedEmail({
            email,
            firstName: user.firstName,
            trackName: track.name,
            amount: track.price,
            invoiceId: invoice.id,
          });
        }

        // Generate JWT token for auto-login (only for new users)
        const token = isNewUser ? generateJWT(user.id) : null;

        return NextResponse.json({
          success: true,
          message: isNewUser ? 'Account created with pending payment' : 'Payment failed - invoice created',
          pendingPayment: true,
          autoLogin: isNewUser, // Only auto-login new users
          token, // JWT token for auto-login (null for existing users)
          invoiceId: invoice.id,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        });
      }
    } catch (error) {
      console.error('Account creation failed:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Checkout processing failed' },
      { status: 500 }
    );
  }
}


// Send welcome email
async function sendWelcomeEmail({
  email,
  firstName,
  trackName,
  loginEmail,
}: {
  email: string;
  firstName: string;
  trackName: string;
  loginEmail: string;
}) {
  const subject = `Welcome to G-Clients! Your ${trackName} enrollment is confirmed`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: var(--primary); text-align: center;">Welcome to G-Clients! 🎉</h1>
      
      <p>Hi ${firstName},</p>
      
      <p>Congratulations! Your enrollment in <strong>${trackName}</strong> has been confirmed and your account has been created.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Account Details:</h3>
        <p><strong>Login Email:</strong> ${loginEmail}</p>
        <p><strong>Password:</strong> The password you created during checkout</p>
        <p style="color: #059669; font-size: 14px;">
          <strong>Tip:</strong> You can update your password anytime from your profile settings.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login to Your Account
        </a>
      </div>
      
      <h3>What's Next?</h3>
      <ol>
        <li>Login to your account using your email and the password you created</li>
        <li>Explore your course dashboard</li>
        <li>Start your first lesson!</li>
        <li>Track your progress and earn your certificate</li>
      </ol>
      
      <p>You now have <strong>lifetime access</strong> to all course materials, and you'll receive a certificate upon completion.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        Need help? Reply to this email or contact our support team.<br>
        Happy learning!<br>
        The G-Clients Team
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

// Send email for pending payment
async function sendPendingPaymentEmail({
  email,
  firstName,
  trackName,
  amount,
  invoiceId,
}: {
  email: string;
  firstName: string;
  trackName: string;
  amount: number;
  invoiceId: string;
}) {
  const subject = `G-Clients Account Created - Payment Pending for ${trackName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb; text-align: center;">Account Created - Payment Pending</h1>
      
      <p>Hi ${firstName},</p>
      
      <p>We've created your G-Clients account, but we couldn't process your payment for <strong>${trackName}</strong>.</p>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Payment Required</h3>
        <p><strong>Amount Due:</strong> $${amount}</p>
        <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Account Details:</h3>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Password:</strong> The password you created during checkout</p>
        <p style="color: #059669; font-size: 14px;">Your account is ready to use!</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
          Login to Account
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/learner/invoice/${invoiceId}" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Payment
        </a>
      </div>
      
      <p>You can login to your account and complete the payment to access your course materials.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        Questions? Reply to this email or contact our support team.<br>
        The G-Clients Team
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

// Send enrollment confirmation email for existing users
async function sendEnrollmentConfirmationEmail({
  email,
  firstName,
  trackName,
}: {
  email: string;
  firstName: string;
  trackName: string;
}) {
  const subject = `Enrollment Confirmed: ${trackName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: var(--primary); text-align: center;">Enrollment Confirmed! 🎉</h1>
      
      <p>Hi ${firstName},</p>
      
      <p>Great news! Your enrollment in <strong>${trackName}</strong> has been confirmed.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Access Your Course
        </a>
      </div>
      
      <p>Login to your existing account to start learning!</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        Happy learning!<br>
        The G-Clients Team
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

// Send payment failed email for existing users
async function sendPaymentFailedEmail({
  email,
  firstName,
  trackName,
  amount,
  invoiceId,
}: {
  email: string;
  firstName: string;
  trackName: string;
  amount: number;
  invoiceId: string;
}) {
  const subject = `Payment Failed - ${trackName} Enrollment Pending`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626; text-align: center;">Payment Failed</h1>
      
      <p>Hi ${firstName},</p>
      
      <p>We couldn't process your payment for <strong>${trackName}</strong>. Don't worry - we've saved your enrollment and created an invoice for you.</p>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Payment Required</h3>
        <p><strong>Amount Due:</strong> $${amount}</p>
        <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
          Login to Account
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/learner/invoice/${invoiceId}" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Payment
        </a>
      </div>
      
      <p>Login to your account and complete the payment to access your course materials.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        Questions? Reply to this email or contact our support team.<br>
        The G-Clients Team
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}