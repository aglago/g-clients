import { NextRequest, NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    const invoices = await invoiceService.getAllInvoices();
    
    // Parse paymentDetails JSON string to object for frontend
    const transformedInvoices = invoices.map(invoice => ({
      ...invoice.toObject(),
      id: String(invoice._id),
      paymentDetails: invoice.paymentDetails ? JSON.parse(invoice.paymentDetails) : null
    }));
    
    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { learnerId, trackId, amount, dueDate, status, paymentDetails } = body;
    
    if (!learnerId || !amount || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid learnerId and non-negative amount are required' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { success: false, message: 'Due date is required' },
        { status: 400 }
      );
    }

    if (!status || !['paid', 'unpaid', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status is required (paid, unpaid, or cancelled)' },
        { status: 400 }
      );
    }

    if (!paymentDetails) {
      return NextResponse.json(
        { success: false, message: 'Payment details are required' },
        { status: 400 }
      );
    }

    const invoice = await invoiceService.createInvoice({
      learnerId,
      trackId,
      amount,
      dueDate,
      status,
      paymentDetails
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