import connectMongoDB from '../mongodb';
import { User, type IUser } from '../models';
import { hashPassword } from '../auth';

export class UserService {
  async getUserById(id: string): Promise<IUser | null> {
    await connectMongoDB();
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    await connectMongoDB();
    return await User.findOne({ email: email.toLowerCase() });
  }

  async getUserByVerificationToken(token: string): Promise<IUser | null> {
    await connectMongoDB();
    return await User.findOne({ verificationToken: token });
  }

  async getUserByResetToken(token: string): Promise<IUser | null> {
    await connectMongoDB();
    return await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'learner';
    contact?: string;
    isVerified?: boolean;
    verificationToken?: string;
  }): Promise<IUser> {
    await connectMongoDB();
    
    const hashedPassword = await hashPassword(userData.password);
    
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    });

    return await user.save();
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    await connectMongoDB();
    
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }
    
    return await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async getAllUsers(): Promise<IUser[]> {
    await connectMongoDB();
    return await User.find();
  }

  async getLearners(): Promise<IUser[]> {
    await connectMongoDB();
    return await User.find({ role: 'learner' });
  }

  async getAdmins(): Promise<IUser[]> {
    await connectMongoDB();
    return await User.find({ role: 'admin' });
  }
}

export const userService = new UserService();