import { ITrack } from './models/Track';
import { ICourse } from './models/Course';
import { Track, Course } from './api';

// Transform MongoDB Track document to frontend Track interface
export function transformTrackDocument(track: ITrack): Track {
  return {
    id: (track._id as unknown as string).toString(),
    name: track.name,
    price: track.price,
    duration: track.duration,
    instructor: track.instructor,
    picture: track.picture,
    description: track.description,
    courses: track.courses ? track.courses.map(course => {
      // If course is populated, extract the title. If not, return the ObjectId as string
      if (typeof course === 'object' && course !== null && 'title' in course) {
        return (course as any).title;
      }
      return course.toString();
    }) : [],
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

// Transform MongoDB Course document to frontend Course interface
export function transformCourseDocument(course: ICourse): Course {
  return {
    id: (course._id as unknown as string).toString(),
    title: course.title,
    track: course.track.toString(),
    picture: course.picture,
    description: course.description,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

// Transform array of MongoDB Course documents
export function transformCourseDocuments(courses: ICourse[]): Course[] {
  return courses.map(transformCourseDocument);
}