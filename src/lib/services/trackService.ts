import connectMongoDB from '../mongodb';
import { Track, type ITrack } from '../models';

export class TrackService {
  async getAllTracks(): Promise<ITrack[]> {
    await connectMongoDB();
    return await Track.find().populate('courses').sort({ createdAt: -1 });
  }

  async getTrackById(id: string): Promise<ITrack | null> {
    await connectMongoDB();
    return await Track.findById(id).populate('courses');
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