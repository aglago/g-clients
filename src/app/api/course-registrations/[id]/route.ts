import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(request);
    
    const registration = db.getCourseRegistrationById(params.id);
    
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Course registration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(registration);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get course registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course registration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
    
    const registration = db.getCourseRegistrationById(params.id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Course registration not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, progress } = body;
    
    const updates: any = {};
    if (status !== undefined) {
      if (!['active', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status. Must be active, completed, or cancelled' },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return NextResponse.json(
          { success: false, message: 'Progress must be a number between 0 and 100' },
          { status: 400 }
        );
      }
      updates.progress = progress;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedRegistration = db.updateCourseRegistration(params.id, updates);
    
    return NextResponse.json(updatedRegistration);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update course registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update course registration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
    
    const registration = db.getCourseRegistrationById(params.id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Course registration not found' },
        { status: 404 }
      );
    }

    db.deleteCourseRegistration(params.id);
    
    return NextResponse.json(
      { success: true, message: 'Course registration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete course registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete course registration' },
      { status: 500 }
    );
  }
}