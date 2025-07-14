import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  learnerId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  trackId?: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  trackId: { type: Schema.Types.ObjectId, ref: 'Track' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentDate: { type: Date },
}, {
  timestamps: true,
});

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);