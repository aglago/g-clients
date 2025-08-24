import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { invoiceService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const userId = authResult.user!.id;
    
    // Get all invoices for the authenticated user
    const invoices = await invoiceService.getInvoicesByLearnerId(userId);
    
    return NextResponse.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get user invoices error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}