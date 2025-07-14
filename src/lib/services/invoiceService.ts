import connectMongoDB from '../mongodb';
import { Invoice, type IInvoice } from '../models';

export class InvoiceService {
  async getAllInvoices(): Promise<IInvoice[]> {
    await connectMongoDB();
    return await Invoice.find()
      .populate('learnerId', 'firstName lastName email')
      .populate('courseId', 'title')
      .populate('trackId', 'name')
      .sort({ createdAt: -1 });
  }

  async getInvoiceById(id: string): Promise<IInvoice | null> {
    await connectMongoDB();
    return await Invoice.findById(id)
      .populate('learnerId', 'firstName lastName email')
      .populate('courseId', 'title')
      .populate('trackId', 'name');
  }

  async getInvoicesByLearnerId(learnerId: string): Promise<IInvoice[]> {
    await connectMongoDB();
    return await Invoice.find({ learnerId })
      .populate('courseId', 'title')
      .populate('trackId', 'name')
      .sort({ createdAt: -1 });
  }

  async createInvoice(invoiceData: {
    learnerId: string;
    courseId?: string;
    trackId?: string;
    amount: number;
    status?: 'pending' | 'paid' | 'cancelled';
  }): Promise<IInvoice> {
    await connectMongoDB();
    const invoice = new Invoice(invoiceData);
    return await invoice.save();
  }

  async updateInvoice(id: string, updates: Partial<IInvoice>): Promise<IInvoice | null> {
    await connectMongoDB();
    return await Invoice.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
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