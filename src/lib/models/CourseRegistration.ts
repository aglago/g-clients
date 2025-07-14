import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseRegistration extends Document {
  courseId: mongoose.Types.ObjectId;
  learnerId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseRegistrationSchema = new Schema<ICourseRegistration>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
}, {
  timestamps: true,
});

export const CourseRegistration = mongoose.models.CourseRegistration || mongoose.model<ICourseRegistration>('CourseRegistration', CourseRegistrationSchema);