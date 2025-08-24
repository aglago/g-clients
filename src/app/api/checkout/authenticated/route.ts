import { NextRequest, NextResponse } from 'next/server';
import { trackService, invoiceService, enrollmentService } from '@/lib/services';
import { sendEmail } from '@/lib/email';
import { getUserFromRequest } from '@/lib/auth';

interface AuthenticatedCheckoutData {
  trackSlug: string;
  paymentSuccess: boolean;
  paymentDetails?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const data: AuthenticatedCheckoutData = await request.json();
    const { trackSlug, paymentSuccess, paymentDetails } = data;

    // Validate required fields
    if (!trackSlug) {
      return NextResponse.json(
        { success: false, message: 'Track slug is required' },
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

    try {
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

        // 3. Send enrollment confirmation email
        await sendEnrollmentConfirmationEmail({
          email: user.email,
          firstName: user.firstName,
          trackName: track.name,
        });

        return NextResponse.json({
          success: true,
          message: 'Enrollment successful',
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

        // Send payment failed email
        await sendPaymentFailedEmail({
          email: user.email,
          firstName: user.firstName,
          trackName: track.name,
          amount: track.price,
          invoiceId: invoice.id,
        });

        return NextResponse.json({
          success: true,
          message: 'Payment failed - invoice created',
          pendingPayment: true,
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
      console.error('Enrollment processing failed:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to process enrollment' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Authenticated checkout processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Checkout processing failed' },
      { status: 500 }
    );
  }
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/learner/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Access Your Course
        </a>
      </div>
      
      <p>You can now access your course materials from your dashboard!</p>
      
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/learner/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
          View Dashboard
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