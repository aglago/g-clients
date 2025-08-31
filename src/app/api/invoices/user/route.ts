import { NextRequest, NextResponse } from 'next/server';
import { requireLearner } from '@/lib/auth';
import { invoiceService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireLearner(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.user ? 403 : 401 }
      );
    }

    const userId = authResult.user!.id;
    
    // Get all invoices for the authenticated user
    const invoices = await invoiceService.getInvoicesByLearnerId(userId);
    
    // Transform the data to include trackName for frontend consumption
    const transformedInvoices = invoices.map(invoice => ({
      ...invoice.toObject(),
      trackName: invoice.trackId?.name || null,
      courseName: invoice.courseId?.title || null
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedInvoices
    });
  } catch (error) {
    console.error('Get user invoices error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}