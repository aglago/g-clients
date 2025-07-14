import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    const tracks = db.getAllTracks();
    
    return NextResponse.json(tracks);
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
    requireAdmin(request);
    
    const body = await request.json();
    const { name, description, courses } = body;
    
    if (!name || !description || !Array.isArray(courses)) {
      return NextResponse.json(
        { success: false, message: 'Name, description, and courses array are required' },
        { status: 400 }
      );
    }

    const track = db.createTrack({
      name,
      description,
      courses
    });
    
    return NextResponse.json(track, { status: 201 });
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