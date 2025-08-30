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
    
    const enrollments = await enrollmentService.getAllTrackEnrollments();
    
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Get track enrollments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch track enrollments' },
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
    const { trackId, learnerId } = body;
    
    if (!trackId || !learnerId) {
      return NextResponse.json(
        { success: false, message: 'trackId and learnerId are required' },
        { status: 400 }
      );
    }

    const enrollment = await enrollmentService.createTrackEnrollment({
      trackId,
      learnerId,
      status: 'active',
      progress: 0
    });
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Create track enrollment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create track enrollment' },
      { status: 500 }
    );
  }
}