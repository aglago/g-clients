'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { coursesApi, Course, queryKeys } from '@/lib/api'

export default function CoursesPage() {
  // Fetch courses using TanStack Query
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.courses.all],
    queryFn: coursesApi.getAllCourses,
  })

  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  // Handle search results
  const handleSearchResults = (results: Course[]) => {
    setFilteredCourses(results)
  }

  // Function to extract searchable text from course items
  const getCourseSearchableText = (course: Course): string[] => {
    return [
      course.title || '',
      course.description || '',
      course.track || '',
    ].filter(Boolean)
  }

  const handleAddCourse = () => {
    // TODO: Implement add course functionality
    console.log('Add new course clicked')
  }

  if (error) {
    return (
      <div>
        <PagesHeaders
          heading="Manage Courses"
          subheading="Browse and manage all available courses"
          items={[]}
          getSearchableText={getCourseSearchableText}
          onSearchResults={handleSearchResults}
          searchPlaceholder="Search courses..."
          addButtonText="Add New Course"
          onAddClick={handleAddCourse}
          isLoading={false}
        />
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load courses. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PagesHeaders
        heading="Manage Courses"
        subheading="Browse and manage all available courses"
        items={courses}
        getSearchableText={getCourseSearchableText}
        onSearchResults={handleSearchResults}
        searchPlaceholder="Search courses by title, description, track..."
        addButtonText="Add New Course"
        onAddClick={handleAddCourse}
        isLoading={isLoading}
      />

      <div className='flex flex-col gap-6 mt-6'>
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <span>Loading courses...</span>
          ) : (
            <span>
              Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-20" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredCourses.length > 0 ? (
            // Course cards
            filteredCourses.map((course) => (
              <Card key={course.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    {course.track && (
                      <Badge variant="secondary" className="mt-2">
                        {course.track}
                      </Badge>
                    )}
                  </div>
                  
                  {course.picture && (
                    <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Course Image</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {course.description}
                  </p>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                    {course.updatedAt !== course.createdAt && (
                      <p>Updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">View</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            // No results
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {courses.length === 0 ? 'No courses available.' : 'No courses match your search.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}