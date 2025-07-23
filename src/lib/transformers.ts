import { ITrack } from './models/Track';
import { Track } from './api';

// Transform MongoDB Track document to frontend Track interface
export function transformTrackDocument(track: ITrack): Track {
  return {
    id: track._id.toString(),
    name: track.name,
    price: track.price,
    duration: track.duration,
    instructor: track.instructor,
    picture: track.picture,
    description: track.description,
    courses: track.courses ? track.courses.map(course => course.toString()) : [],
    rating: track.rating || 0,
    reviewsCount: track.reviewsCount || 0,
    createdAt: track.createdAt.toISOString(),
    updatedAt: track.updatedAt.toISOString(),
  };
}

// Transform array of MongoDB Track documents
export function transformTrackDocuments(tracks: ITrack[]): Track[] {
  return tracks.map(transformTrackDocument);
}