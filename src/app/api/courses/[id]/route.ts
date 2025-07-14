import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);
    
    const course = await courseService.getCourseById(params.id);
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get course error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    
    const course = await courseService.getCourseById(params.id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, instructor, duration, price } = body;
    
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (instructor !== undefined) updates.instructor = instructor;
    if (duration !== undefined) {
      if (typeof duration !== 'number' || duration <= 0) {
        return NextResponse.json(
          { success: false, message: 'Duration must be a positive number' },
          { status: 400 }
        );
      }
      updates.duration = duration;
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json(
          { success: false, message: 'Price must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedCourse = await courseService.updateCourse(params.id, updates);
    
    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update course error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    
    const course = await courseService.getCourseById(params.id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    await courseService.deleteCourse(params.id);
    
    return NextResponse.json(
      { success: true, message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete course error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}