import { NextResponse } from 'next/server';
import { courseService, userService, trackService } from '@/lib/services';

export async function GET() {
  try {
    // Get counts for public stats without requiring authentication
    const [courses, learners, tracks] = await Promise.all([
      courseService.getAllCourses(),
      userService.getLearners(),
      trackService.getAllTracks()
    ]);

    const stats = {
      coursesCount: courses.length,
      studentsCount: learners.length,
      tracksCount: tracks.length,
      hoursOfContent: 1000 // Static for now, could be calculated based on course duration
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get public stats error:', error);
    
    // Return fallback stats if database fails
    return NextResponse.json({
      coursesCount: 50,
      studentsCount: 2500,
      tracksCount: 8,
      hoursOfContent: 1000
    });
  }
}