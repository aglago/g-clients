import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
}, {
  timestamps: true,
});

export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);