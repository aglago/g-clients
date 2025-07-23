import { NextRequest, NextResponse } from 'next/server';
import { trackService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { transformTrackDocuments, transformTrackDocument } from '@/lib/transformers';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const tracks = await trackService.getAllTracks();
    const transformedTracks = transformTrackDocuments(tracks);
    
    return NextResponse.json(transformedTracks);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get tracks error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { name, price, duration, instructor, picture, description, courses } = body;
    
    if (!name || !description || price === undefined || duration === undefined || !instructor || !picture) {
      return NextResponse.json(
        { success: false, message: 'Name, price, duration, instructor, picture, and description are required' },
        { status: 400 }
      );
    }

    if (courses !== undefined && !Array.isArray(courses)) {
      return NextResponse.json(
        { success: false, message: 'Courses must be an array if provided' },
        { status: 400 }
      );
    }

    const track = await trackService.createTrack({
      name,
      price: Number(price),
      duration: Number(duration),
      instructor,
      picture,
      description,
      courses: courses || []
    });
    
    const transformedTrack = transformTrackDocument(track);
    return NextResponse.json(transformedTrack, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create track error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create track' },
      { status: 500 }
    );
  }
}