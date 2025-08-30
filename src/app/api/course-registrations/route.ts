import { NextRequest, NextResponse } from 'next/server';
import { enrollmentService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    const registrations = await enrollmentService.getAllCourseRegistrations();
    
    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Get course registrations error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
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
    console.error('Create course registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course registration' },
      { status: 500 }
    );
  }
}