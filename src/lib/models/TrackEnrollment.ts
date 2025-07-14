import mongoose, { Schema, Document } from 'mongoose';

export interface ITrackEnrollment extends Document {
  trackId: mongoose.Types.ObjectId;
  learnerId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrackEnrollmentSchema = new Schema<ITrackEnrollment>({
  trackId: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
}, {
  timestamps: true,
});

export const TrackEnrollment = mongoose.models.TrackEnrollment || mongoose.model<ITrackEnrollment>('TrackEnrollment', TrackEnrollmentSchema);