'use client'

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SearchRef } from '@/components/ui/search'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { coursesApi, Course, queryKeys } from '@/lib/api'

export default function CoursesSearchExample() {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const searchRef = useRef<SearchRef>(null)

  // Fetch courses using TanStack Query
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.courses.all],
    queryFn: coursesApi.getAllCourses,
  })

  // Update filtered courses when courses data changes
  useState(() => {
    setFilteredCourses(courses)
  }, [courses])

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
      // Add any other searchable fields from your Course interface
    ].filter(Boolean)
  }

  const handleClearSearch = () => {
    searchRef.current?.clear()
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Failed to load courses.</div>
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full max-w-md">
          <Search
            ref={searchRef}
            items={courses}
            getSearchableText={getCourseSearchableText}
            onSearchResults={handleSearchResults}
            placeholder="Search courses by title, description, track..."
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearSearch}>
            Clear Search
          </Button>
          <Button>Add New Course</Button>
        </div>
      </div>

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
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
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
                    <p className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded w-fit">
                      {course.track}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>

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
            {searchRef.current?.getValue() && (
              <Button variant="link" onClick={handleClearSearch} className="mt-2">
                Clear search to see all courses
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}