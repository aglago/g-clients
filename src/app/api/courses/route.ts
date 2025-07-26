import { NextRequest, NextResponse } from 'next/server';
import { courseService, trackService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { transformCourseDocuments, transformCourseDocument } from '@/lib/transformers';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const courses = await courseService.getAllCourses();
    const transformedCourses = transformCourseDocuments(courses);
    
    return NextResponse.json(transformedCourses);
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
    const { title, track, picture, description } = body;
    
    if (!title || !track || !picture || !description) {
      return NextResponse.json(
        { success: false, message: 'Title, track, picture, and description are required' },
        { status: 400 }
      );
    }

    const course = await courseService.createCourse({
      title,
      track,
      picture,
      description
    });

    // Add the course to the track's courses array
    const trackDoc = await trackService.getTrackById(track);
    if (trackDoc) {
      const courseObjectId = course._id as Types.ObjectId;
      const updatedCourses = [...(trackDoc.courses || []), courseObjectId];
      await trackService.updateTrack(track, { courses: updatedCourses });
    }
    
    const transformedCourse = transformCourseDocument(course);
    return NextResponse.json(transformedCourse, { status: 201 });
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