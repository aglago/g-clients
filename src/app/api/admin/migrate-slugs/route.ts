import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { migrateSlugs } from '@/lib/migrate-slugs';

export async function POST(request: NextRequest) {
  try {
    // Only admin can run migrations
    await requireAdmin(request);
    
    await migrateSlugs();
    
    return NextResponse.json({
      success: true,
      message: 'Slug migration completed successfully'
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Migration failed' },
      { status: 500 }
    );
  }
}