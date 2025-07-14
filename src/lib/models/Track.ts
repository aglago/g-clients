import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  name: string;
  description: string;
  courses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
}, {
  timestamps: true,
});

export const Track = mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);