import connectMongoDB from '../mongodb';
import { Course, type ICourse } from '../models';
import { Types } from 'mongoose';

export class CourseService {
  async getAllCourses(): Promise<ICourse[]> {
    await connectMongoDB();
    return await Course.find().sort({ createdAt: -1 });
  }

  async getCourseById(id: string): Promise<ICourse | null> {
    await connectMongoDB();
    return await Course.findById(id);
  }

  async createCourse(courseData: {
    title: string;
    track: string;
    picture: string;
    description: string;
  }): Promise<ICourse> {
    await connectMongoDB();
    const course = new Course({
      ...courseData,
      track: new Types.ObjectId(courseData.track)
    });
    return await course.save();
  }

  async updateCourse(id: string, updates: Partial<{
    title: string;
    track: Types.ObjectId;
    picture: string;
    description: string;
  }>): Promise<ICourse | null> {
    await connectMongoDB();
    return await Course.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteCourse(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await Course.findByIdAndDelete(id);
    return !!result;
  }

  async searchCourses(query: string): Promise<ICourse[]> {
    await connectMongoDB();
    return await Course.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
  }
}

export const courseService = new CourseService();