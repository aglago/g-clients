import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    const invoices = db.getAllInvoices();
    
    return NextResponse.json(invoices);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const body = await request.json();
    const { learnerId, courseId, trackId, amount } = body;
    
    if (!learnerId || !amount || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid learnerId and non-negative amount are required' },
        { status: 400 }
      );
    }

    if (!courseId && !trackId) {
      return NextResponse.json(
        { success: false, message: 'Either courseId or trackId must be provided' },
        { status: 400 }
      );
    }

    const invoice = db.createInvoice({
      learnerId,
      courseId,
      trackId,
      amount,
      status: 'pending'
    });
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}