import { NextRequest, NextResponse } from 'next/server';
import { trackService } from '@/lib/services';
import { transformTrackDocument } from '@/lib/transformers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug is required' },
        { status: 400 }
      );
    }

    const track = await trackService.getTrackBySlugWithEnrollmentCount(slug);
    
    if (!track) {
      return NextResponse.json(
        { success: false, message: 'Track not found' },
        { status: 404 }
      );
    }

    const transformedTrack = transformTrackDocument(track);
    return NextResponse.json(transformedTrack);
  } catch (error) {
    console.error('Get track by slug error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch track' },
      { status: 500 }
    );
  }
}