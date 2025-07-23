import { NextRequest, NextResponse } from 'next/server';
import { trackService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { Types } from 'mongoose';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { getCloudinaryPublicId } from '@/lib/upload';
import { transformTrackDocument } from '@/lib/transformers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    
    const track = await trackService.getTrackById(id);
    
    if (!track) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }
    
    const transformedTrack = transformTrackDocument(track);
    return NextResponse.json(transformedTrack);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get track error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch track' },
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
    
    const track = await trackService.getTrackById(id);
    if (!track) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, price, duration, instructor, picture, description, courses, rating, reviewsCount } = body;
    
    const updates: Partial<{
      name: string;
      price: number;
      duration: number;
      instructor: string;
      picture: string;
      description: string;
      courses: Types.ObjectId[];
      rating: number;
      reviewsCount: number;
    }> = {};
    
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = Number(price);
    if (duration !== undefined) updates.duration = Number(duration);
    if (instructor !== undefined) updates.instructor = instructor;
    if (picture !== undefined) updates.picture = picture;
    if (description !== undefined) updates.description = description;
    if (rating !== undefined) updates.rating = Number(rating);
    if (reviewsCount !== undefined) updates.reviewsCount = Number(reviewsCount);
    
    if (courses !== undefined) {
      if (!Array.isArray(courses)) {
        return NextResponse.json(
          { success: false, message: 'Courses must be an array' },
          { status: 400 }
        );
      }
      updates.courses = courses.map(courseId => new Types.ObjectId(courseId));
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedTrack = await trackService.updateTrack(id, updates);
    
    if (!updatedTrack) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }
    
    const transformedTrack = transformTrackDocument(updatedTrack);
    return NextResponse.json(transformedTrack);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update track error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update track' },
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
    
    const track = await trackService.getTrackById(id);
    if (!track) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }

    // Delete track image from Cloudinary if exists
    if (track.picture) {
      try {
        const publicId = getCloudinaryPublicId(track.picture);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with track deletion even if image deletion fails
      }
    }

    await trackService.deleteTrack(id);
    
    return NextResponse.json(
      { success: true, message: 'Track deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete track error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete track' },
      { status: 500 }
    );
  }
}