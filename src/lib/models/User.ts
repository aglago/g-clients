import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'learner';
  contact?: string;
  profileImage?: string;
  isVerified: boolean;
  verificationOTP?: string;
  verificationOTPExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  // Additional learner fields
  gender?: 'male' | 'female' | 'other';
  location?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'learner'], required: true },
  contact: { type: String },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  // Additional learner fields
  gender: { type: String, enum: ['male', 'female', 'other'] },
  location: { type: String },
  bio: { type: String },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);