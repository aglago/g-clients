import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  name: string;
  slug: string;
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

// Helper function to create slug from name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

const TrackSchema = new Schema<ITrack>({
  name: { type: String, required: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
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

// Pre-save middleware to generate slug
TrackSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = createSlug(this.name);
  }
  next();
});

export const Track = mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);