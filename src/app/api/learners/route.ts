import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const learners = await userService.getLearners();
    
    const sanitizedLearners = learners.map(learner => ({
      id: learner.id,
      firstName: learner.firstName,
      lastName: learner.lastName,
      email: learner.email,
      contact: learner.contact,
      createdAt: learner.createdAt,
      updatedAt: learner.updatedAt
    }));
    
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
    requireAdmin(request);
    
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

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const learner = db.createUser({
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