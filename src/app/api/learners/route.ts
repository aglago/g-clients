
import { NextRequest, NextResponse } from 'next/server';
import { userService, invoiceService } from '@/lib/services';
import { requireAdmin, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const learners = await userService.getLearners();
    
    // Get all invoices to calculate amount paid for each learner
    const allInvoices = await invoiceService.getAllInvoices();
    
    const sanitizedLearners = learners.map(learner => {
      // Calculate total amount paid from paid invoices
      const learnerInvoices = allInvoices.filter(invoice => {
        // learnerId is populated, so it's an object with _id
        const invoiceLearnerIdStr = (invoice.learnerId as { _id: unknown })?._id?.toString() || invoice.learnerId.toString();
        return invoiceLearnerIdStr === String((learner as { _id: unknown })._id) && invoice.status === 'paid';
      });
      const amountPaid = learnerInvoices.reduce((total, invoice) => total + invoice.amount, 0);
      
      return {
        id: learner.id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        contact: learner.contact,
        gender: learner.gender,
        location: learner.location,
        bio: learner.bio,
        amountPaid,
        createdAt: learner.createdAt,
        updatedAt: learner.updatedAt
      };
    });
    
    return NextResponse.json(sanitizedLearners);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Get learners error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch learners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword, contact } = body;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
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

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const learner = await userService.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'learner',
      contact,
      isVerified: true
    });

    const sanitizedLearner = {
      id: learner.id,
      firstName: learner.firstName,
      lastName: learner.lastName,
      email: learner.email,
      contact: learner.contact,
      createdAt: learner.createdAt,
      updatedAt: learner.updatedAt
    };
    
    return NextResponse.json(sanitizedLearner, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create learner error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create learner' },
      { status: 500 }
    );
  }
}