import connectMongoDB from '../mongodb';
import { Invoice, type IInvoice } from '../models';
import mongoose from 'mongoose';

export class InvoiceService {
  async getAllInvoices(): Promise<IInvoice[]> {
    await connectMongoDB();
    return await Invoice.find()
      .populate('learnerId', 'firstName lastName email')
      .populate('courseId', 'title')
      .populate('trackId', 'name price')
      .sort({ createdAt: -1 });
  }

  async getInvoiceById(id: string): Promise<IInvoice | null> {
    await connectMongoDB();
    return await Invoice.findById(id)
      .populate('learnerId', 'firstName lastName email')
      .populate('courseId', 'title')
      .populate('trackId', 'name price');
  }

  async getInvoicesByLearnerId(learnerId: string): Promise<IInvoice[]> {
    await connectMongoDB();
    return await Invoice.find({ learnerId })
      .populate('courseId', 'title')
      .populate('trackId', 'name price')
      .sort({ createdAt: -1 });
  }

  async createInvoice(invoiceData: {
    learnerId: string;
    courseId?: string;
    trackId?: string;
    amount: number;
    dueDate: string | Date;
    paymentDetails: string;
    status?: 'unpaid' | 'paid' | 'cancelled';
  }): Promise<IInvoice> {
    await connectMongoDB();
    
    const invoicePayload = {
      learnerId: invoiceData.learnerId,
      amount: invoiceData.amount,
      dueDate: new Date(invoiceData.dueDate),
      paymentDetails: invoiceData.paymentDetails,
      status: invoiceData.status || 'unpaid' as const,
      ...(invoiceData.trackId && { trackId: new mongoose.Types.ObjectId(invoiceData.trackId) }),
      ...(invoiceData.courseId && { courseId: new mongoose.Types.ObjectId(invoiceData.courseId) })
    };
    
    const invoice = new Invoice(invoicePayload);
    return await invoice.save();
  }

  async updateInvoice(id: string, updates: Partial<{
    trackId?: string;
    amount?: number;
    dueDate?: Date;
    paymentDetails?: string;
    status?: 'unpaid' | 'paid' | 'cancelled';
    paymentDate?: Date;
  }>): Promise<IInvoice | null> {
    await connectMongoDB();
    
    const updateData: Record<string, unknown> = { 
      ...updates, 
      updatedAt: new Date()
    };
    
    // Convert string trackId to ObjectId if provided
    if (updates.trackId) {
      updateData.trackId = new mongoose.Types.ObjectId(updates.trackId);
    }
    
    return await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('learnerId', 'firstName lastName email')
     .populate('courseId', 'title')
     .populate('trackId', 'name');
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await Invoice.findByIdAndDelete(id);
    return !!result;
  }

  async markInvoiceAsPaid(id: string): Promise<IInvoice | null> {
    await connectMongoDB();
    return await Invoice.findByIdAndUpdate(
      id,
      { 
        status: 'paid',
        paymentDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('learnerId', 'firstName lastName email')
     .populate('courseId', 'title')
     .populate('trackId', 'name');
  }
}

export const invoiceService = new InvoiceService();