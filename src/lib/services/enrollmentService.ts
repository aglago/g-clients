import connectMongoDB from '../mongodb';
import { TrackEnrollment, CourseRegistration, type ITrackEnrollment, type ICourseRegistration } from '../models';

export class EnrollmentService {
  // Track Enrollments
  async getAllTrackEnrollments(): Promise<ITrackEnrollment[]> {
    await connectMongoDB();
    return await TrackEnrollment.find()
      .populate('trackId', 'name description')
      .populate('learnerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getTrackEnrollmentById(id: string): Promise<ITrackEnrollment | null> {
    await connectMongoDB();
    return await TrackEnrollment.findById(id)
      .populate('trackId', 'name description')
      .populate('learnerId', 'firstName lastName email');
  }

  async getTrackEnrollmentsByLearnerId(learnerId: string): Promise<ITrackEnrollment[]> {
    await connectMongoDB();
    return await TrackEnrollment.find({ learnerId })
      .populate('trackId', 'name description slug')
      .sort({ createdAt: -1 });
  }

  async getEnrollmentByUserAndTrack(learnerId: string, trackId: string): Promise<ITrackEnrollment | null> {
    await connectMongoDB();
    return await TrackEnrollment.findOne({ 
      learnerId, 
      trackId 
    })
      .populate('trackId', 'name description')
      .populate('learnerId', 'firstName lastName email');
  }

  async createTrackEnrollment(enrollmentData: {
    trackId: string;
    learnerId: string;
    status?: 'active' | 'completed' | 'cancelled';
    progress?: number;
  }): Promise<ITrackEnrollment> {
    await connectMongoDB();
    const enrollment = new TrackEnrollment({
      ...enrollmentData,
      enrollmentDate: new Date(),
    });
    return await enrollment.save();
  }

  async updateTrackEnrollment(id: string, updates: Partial<ITrackEnrollment>): Promise<ITrackEnrollment | null> {
    await connectMongoDB();
    return await TrackEnrollment.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate('trackId', 'name description')
     .populate('learnerId', 'firstName lastName email');
  }

  async deleteTrackEnrollment(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await TrackEnrollment.findByIdAndDelete(id);
    return !!result;
  }

  async getTrackEnrollmentCount(trackId: string): Promise<number> {
    await connectMongoDB();
    return await TrackEnrollment.countDocuments({ 
      trackId,
      status: { $in: ['active', 'completed'] } // Exclude cancelled enrollments
    });
  }

  // Course Registrations
  async getAllCourseRegistrations(): Promise<ICourseRegistration[]> {
    await connectMongoDB();
    return await CourseRegistration.find()
      .populate('courseId', 'title description instructor')
      .populate('learnerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getCourseRegistrationById(id: string): Promise<ICourseRegistration | null> {
    await connectMongoDB();
    return await CourseRegistration.findById(id)
      .populate('courseId', 'title description instructor')
      .populate('learnerId', 'firstName lastName email');
  }

  async getCourseRegistrationsByLearnerId(learnerId: string): Promise<ICourseRegistration[]> {
    await connectMongoDB();
    return await CourseRegistration.find({ learnerId })
      .populate('courseId', 'title description instructor')
      .sort({ createdAt: -1 });
  }

  async createCourseRegistration(registrationData: {
    courseId: string;
    learnerId: string;
    status?: 'active' | 'completed' | 'cancelled';
    progress?: number;
  }): Promise<ICourseRegistration> {
    await connectMongoDB();
    const registration = new CourseRegistration({
      ...registrationData,
      enrollmentDate: new Date(),
    });
    return await registration.save();
  }

  async updateCourseRegistration(id: string, updates: Partial<ICourseRegistration>): Promise<ICourseRegistration | null> {
    await connectMongoDB();
    return await CourseRegistration.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate('courseId', 'title description instructor')
     .populate('learnerId', 'firstName lastName email');
  }

  async deleteCourseRegistration(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await CourseRegistration.findByIdAndDelete(id);
    return !!result;
  }

  async updateProgress(id: string, progress: number, type: 'track' | 'course'): Promise<ITrackEnrollment | ICourseRegistration | null> {
    await connectMongoDB();
    
    const status = progress >= 100 ? 'completed' : 'active';
    const updates = { progress, status, updatedAt: new Date() };

    if (type === 'track') {
      return await TrackEnrollment.findByIdAndUpdate(id, updates, { new: true })
        .populate('trackId', 'name description')
        .populate('learnerId', 'firstName lastName email');
    } else {
      return await CourseRegistration.findByIdAndUpdate(id, updates, { new: true })
        .populate('courseId', 'title description instructor')
        .populate('learnerId', 'firstName lastName email');
    }
  }
}

export const enrollmentService = new EnrollmentService();