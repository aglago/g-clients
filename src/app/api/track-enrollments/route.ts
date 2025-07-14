import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    const enrollments = db.getAllTrackEnrollments();
    
    return NextResponse.json(enrollments);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get track enrollments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch track enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const body = await request.json();
    const { trackId, learnerId } = body;
    
    if (!trackId || !learnerId) {
      return NextResponse.json(
        { success: false, message: 'trackId and learnerId are required' },
        { status: 400 }
      );
    }

    const enrollment = db.createTrackEnrollment({
      trackId,
      learnerId,
      enrollmentDate: new Date().toISOString(),
      status: 'active',
      progress: 0
    });
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create track enrollment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create track enrollment' },
      { status: 500 }
    );
  }
}