import { NextRequest, NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    
    const invoice = await invoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, dueDate, paymentDetails, status, paymentDate } = body;
    
    const updates: Partial<{amount: number; dueDate: Date; paymentDetails: string; status: 'unpaid' | 'paid' | 'cancelled'; paymentDate: Date}> = {};
    
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount < 0) {
        return NextResponse.json(
          { success: false, message: 'Amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.amount = amount;
    }
    
    if (dueDate !== undefined) {
      updates.dueDate = new Date(dueDate);
    }
    
    if (paymentDetails !== undefined) {
      if (typeof paymentDetails !== 'string' || paymentDetails.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: 'Payment details must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.paymentDetails = paymentDetails.trim();
    }
    
    if (status !== undefined) {
      if (!['unpaid', 'paid', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status. Must be unpaid, paid, or cancelled' },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    
    if (paymentDate !== undefined) updates.paymentDate = new Date(paymentDate);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedInvoice = await invoiceService.updateInvoice(id, updates);
    
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }

    await invoiceService.deleteInvoice(id);
    
    return NextResponse.json(
      { success: true, message: 'Invoice deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}