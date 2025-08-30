import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { migrateSlugs } from '@/lib/migrate-slugs';

export async function POST(request: NextRequest) {
  try {
    // Only admin can run migrations
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    await migrateSlugs();
    
    return NextResponse.json({
      success: true,
      message: 'Slug migration completed successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Migration failed' },
      { status: 500 }
    );
  }
}