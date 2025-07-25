import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  track: Types.ObjectId;
  picture: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  track: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
  picture: { type: String, required: true },
  description: { type: String, required: true },
}, {
  timestamps: true,
});

// Delete the model from cache if it exists to ensure we use the updated schema
delete mongoose.models.Course;

export const Course = mongoose.model<ICourse>('Course', CourseSchema);