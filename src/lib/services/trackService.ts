import connectMongoDB from '../mongodb';
import { Track, type ITrack } from '../models';
import { enrollmentService } from './enrollmentService';

export class TrackService {
  async getAllTracks(): Promise<ITrack[]> {
    await connectMongoDB();
    return await Track.find().populate('courses').sort({ createdAt: -1 });
  }

  async getTrackById(id: string): Promise<ITrack | null> {
    await connectMongoDB();
    return await Track.findById(id).populate('courses');
  }

  async getTrackBySlug(slug: string): Promise<ITrack | null> {
    await connectMongoDB();
    
    // First try to find by existing slug field
    let track = await Track.findOne({ slug }).populate('courses');
    
    if (!track) {
      // Fallback: find all tracks and match by generated slug
      const allTracks = await Track.find().populate('courses');
      track = allTracks.find(t => {
        const generatedSlug = this.createSlug(t.name);
        return generatedSlug === slug;
      }) || null;
    }
    
    return track;
  }

  async getTrackBySlugWithEnrollmentCount(slug: string): Promise<(ITrack & { enrolledCount: number }) | null> {
    const track = await this.getTrackBySlug(slug);
    if (!track) return null;
    
    const enrolledCount = await enrollmentService.getTrackEnrollmentCount((track as { _id: { toString(): string } })._id.toString());
    
    return {
      ...track.toObject(),
      enrolledCount
    };
  }

  // Helper method to create slug (same as in Track model)
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  async createTrack(trackData: {
    name: string;
    price: number;
    duration: number;
    instructor: string;
    picture: string;
    description: string;
    courses?: string[];
  }): Promise<ITrack> {
    await connectMongoDB();
    const track = new Track(trackData);
    return await track.save();
  }

  async updateTrack(id: string, updates: Partial<ITrack>): Promise<ITrack | null> {
    await connectMongoDB();
    return await Track.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate('courses');
  }

  async deleteTrack(id: string): Promise<boolean> {
    await connectMongoDB();
    const result = await Track.findByIdAndDelete(id);
    return !!result;
  }

  async addCourseToTrack(trackId: string, courseId: string): Promise<ITrack | null> {
    await connectMongoDB();
    return await Track.findByIdAndUpdate(
      trackId,
      { $addToSet: { courses: courseId } },
      { new: true }
    ).populate('courses');
  }

  async removeCourseFromTrack(trackId: string, courseId: string): Promise<ITrack | null> {
    await connectMongoDB();
    return await Track.findByIdAndUpdate(
      trackId,
      { $pull: { courses: courseId } },
      { new: true }
    ).populate('courses');
  }

  async searchTracks(query: string): Promise<ITrack[]> {
    await connectMongoDB();
    return await Track.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { instructor: { $regex: query, $options: 'i' } }
      ]
    }).populate('courses').sort({ createdAt: -1 });
  }
}

export const trackService = new TrackService();