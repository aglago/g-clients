'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { X, Tag } from 'lucide-react'
import CourseForm from '@/components/forms/course-form'
import CourseDetailsModal from '@/components/modals/course-details-modal'
import { coursesApi, Course, queryKeys, CreateCourseRequest, UpdateCourseRequest, tracksApi, Track } from '@/lib/api'
import Image from 'next/image'

export default function CoursesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Fetch courses using TanStack Query
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.courses.all],
    queryFn: coursesApi.getAllCourses,
  })

  // Fetch tracks for display
  const { data: tracks = [] } = useQuery({
    queryKey: [queryKeys.tracks.all],
    queryFn: tracksApi.getAllTracks,
  })

  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  // Mutations for CRUD operations
  const createCourseMutation = useMutation({
    mutationFn: coursesApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.courses.all] })
      toast.success('Course created successfully!')
      setShowForm(false)
    },
    onError: () => {
      toast.error('Failed to create course')
    },
  })

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) => 
      coursesApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.courses.all] })
      toast.success('Course updated successfully!')
      setEditingCourse(null)
      setShowForm(false)
    },
    onError: () => {
      toast.error('Failed to update course')
    },
  })

  const deleteCourseMutation = useMutation({
    mutationFn: coursesApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.courses.all] })
      toast.success('Course deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete course')
    },
  })

  // Handle search results
  const handleSearchResults = (results: Course[]) => {
    setFilteredCourses(results)
  }

  // Function to extract searchable text from course items
  const getCourseSearchableText = (course: Course): string[] => {
    const track = tracks.find((t: Track) => t.id === course.track)
    return [
      course.title || '',
      course.description || '',
      track?.name || '',
      track?.instructor || '',
    ].filter(Boolean)
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowForm(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowForm(true)
    setShowDetails(false)
  }

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowDetails(true)
  }

  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourseMutation.mutateAsync(course.id)
    }
  }

  const handleFormSubmit = async (data: CreateCourseRequest | UpdateCourseRequest) => {
    if (editingCourse) {
      await updateCourseMutation.mutateAsync({ 
        id: editingCourse.id, 
        data: data as UpdateCourseRequest 
      })
    } else {
      await createCourseMutation.mutateAsync(data as CreateCourseRequest)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCourse(null)
  }

  const getTrackName = (trackId: string) => {
    const track = tracks.find((t: Track) => t.id === trackId)
    return track?.name || 'Unknown Track'
  }

  if (error) {
    return (
      <div>
        <PagesHeaders
          heading="Manage Courses"
          subheading="Filter, sort, and access detailed courses"
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
        subheading="Filter, sort, and access detailed courses"
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
              <div key={index} className="bg-background border rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredCourses.length > 0 ? (
            // Course tiles
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-background border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Course Image */}
                  {course.picture && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={course.picture}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Track:</span>
                      <span>{getTrackName(course.track)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewCourse(course)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditCourse(course)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
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

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[496px] max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 top-8 z-10 p-1 h-auto w-auto bg-background/80 hover:bg-background"
              onClick={handleFormCancel}
            >
              <X className="h-6 w-8 text-[#7F7E83]" />
              <span className="sr-only">Close</span>
            </Button>
            <CourseForm
              course={editingCourse || undefined}
              onSubmit={handleFormSubmit}
              isLoading={createCourseMutation.isPending || updateCourseMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      <CourseDetailsModal
        course={selectedCourse}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />
    </div>
  )
}