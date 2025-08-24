import { NextRequest, NextResponse } from 'next/server';
import { courseService, trackService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';
import { transformCourseDocuments, transformCourseDocument } from '@/lib/transformers';
import { Types } from 'mongoose';

export async function GET() {
  try {
    // Allow public access to courses for learner homepage
    const courses = await courseService.getAllCourses();
    const transformedCourses = transformCourseDocuments(courses);
    
    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
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
    console.error('Create course error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course' },
      { status: 500 }
    );
  }
}