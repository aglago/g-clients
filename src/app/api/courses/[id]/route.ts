import { NextRequest, NextResponse } from 'next/server';
import { courseService, trackService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { transformCourseDocument } from '@/lib/transformers';
import { Types } from 'mongoose';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { getCloudinaryPublicId } from '@/lib/upload';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    
    const course = await courseService.getCourseById(id);
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    const transformedCourse = transformCourseDocument(course);
    return NextResponse.json(transformedCourse);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const course = await courseService.getCourseById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, track, picture, description } = body;
    
    const updates: Partial<{
      title: string;
      track: Types.ObjectId;
      picture: string;
      description: string;
    }> = {};
    
    if (title !== undefined) updates.title = title;
    if (track !== undefined) updates.track = new Types.ObjectId(track);
    if (picture !== undefined) updates.picture = picture;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Handle track change - remove from old track and add to new track
    if (track !== undefined && track !== course.track.toString()) {
      // Remove from old track
      const oldTrackDoc = await trackService.getTrackById(course.track.toString());
      if (oldTrackDoc && oldTrackDoc.courses) {
        const updatedOldCourses = oldTrackDoc.courses.filter(
          courseId => courseId.toString() !== id
        );
        await trackService.updateTrack(course.track.toString(), { courses: updatedOldCourses });
      }

      // Add to new track
      const newTrackDoc = await trackService.getTrackById(track);
      if (newTrackDoc) {
        const courseObjectId = new Types.ObjectId(id);
        const updatedNewCourses = [...(newTrackDoc.courses || []), courseObjectId];
        await trackService.updateTrack(track, { courses: updatedNewCourses });
      }
    }

    const updatedCourse = await courseService.updateCourse(id, updates);
    
    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    const transformedCourse = transformCourseDocument(updatedCourse);
    return NextResponse.json(transformedCourse);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const course = await courseService.getCourseById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Remove course from track's courses array
    const trackDoc = await trackService.getTrackById(course.track.toString());
    if (trackDoc && trackDoc.courses) {
      const updatedCourses = trackDoc.courses.filter(
        courseId => courseId.toString() !== id
      );
      await trackService.updateTrack(course.track.toString(), { courses: updatedCourses });
    }

    // Delete course image from Cloudinary if exists
    if (course.picture) {
      try {
        const publicId = getCloudinaryPublicId(course.picture);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with course deletion even if image deletion fails
      }
    }

    await courseService.deleteCourse(id);
    
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