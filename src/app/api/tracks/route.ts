import { NextRequest, NextResponse } from 'next/server';
import { trackService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';
import { transformTrackDocuments, transformTrackDocument } from '@/lib/transformers';

export async function GET() {
  try {
    // Allow public access to tracks for learner homepage
    const tracks = await trackService.getAllTracks();
    const transformedTracks = transformTrackDocuments(tracks);
    
    return NextResponse.json(transformedTracks);
  } catch (error) {
    console.error('Get tracks error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracks' },
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
    console.error('Create track error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create track' },
      { status: 500 }
    );
  }
}