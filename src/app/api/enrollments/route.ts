import { NextRequest, NextResponse } from 'next/server';
import { requireLearner } from '@/lib/auth';
import { enrollmentService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireLearner(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.user ? 403 : 401 }
      );
    }

    const userId = authResult.user!.id;
    
    // Get all enrollments for the authenticated user
    const enrollments = await enrollmentService.getTrackEnrollmentsByLearnerId(userId);
    
    return NextResponse.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}