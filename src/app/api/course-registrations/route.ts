import { NextRequest, NextResponse } from 'next/server';
import { enrollmentService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const registrations = await enrollmentService.getAllCourseRegistrations();
    
    return NextResponse.json(registrations);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get course registrations error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { courseId, learnerId } = body;
    
    if (!courseId || !learnerId) {
      return NextResponse.json(
        { success: false, message: 'courseId and learnerId are required' },
        { status: 400 }
      );
    }

    const registration = await enrollmentService.createCourseRegistration({
      courseId,
      learnerId,
      status: 'active',
      progress: 0
    });
    
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create course registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course registration' },
      { status: 500 }
    );
  }
}