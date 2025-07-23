import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  name: string;
  price: number;
  duration: number;
  instructor: string;
  picture: string;
  description: string;
  courses?: mongoose.Types.ObjectId[];
  rating?: number;
  reviewsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  instructor: { type: String, required: true },
  picture: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const Track = mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);