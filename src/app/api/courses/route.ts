import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const courses = await courseService.getAllCourses();
    
    return NextResponse.json(courses);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { title, description, instructor, duration, price } = body;
    
    if (!title || !description || !instructor || !duration || !price) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { success: false, message: 'Duration must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const course = await courseService.createCourse({
      title,
      description,
      instructor,
      duration,
      price
    });
    
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create course error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course' },
      { status: 500 }
    );
  }
}