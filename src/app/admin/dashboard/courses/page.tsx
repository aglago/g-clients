'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import CourseForm from '@/components/forms/course-form'
import { coursesApi, Course, queryKeys, CreateCourseRequest, UpdateCourseRequest, tracksApi, Track } from '@/lib/api'
import Edit from '@/components/icons/edit'
import Trash from '@/components/icons/trash'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'

export default function CoursesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Mutations for CRUD operations
  const createCourseMutation = useMutation({
    mutationFn: coursesApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.courses.all] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
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

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course)
    setShowForm(true)
  }, [])


  const handleDeleteCourse = useCallback(async (course: Course) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    setIsDeleting(course.id);
    try {
      await deleteCourseMutation.mutateAsync(course.id);
    } catch (error) {
      console.error('Failed to delete course:', error);
    } finally {
      setIsDeleting(null);
    }
  }, [deleteCourseMutation])

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

  const getTrackName = useCallback((trackId: string) => {
    const track = tracks.find((t: Track) => t.id === trackId)
    return track?.name || 'Unknown Track'
  }, [tracks])

  // Define table columns
  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'COURSES',
        cell: ({ row }) => {
          const course = row.original
          return (
            <div className="flex items-center gap-3">
              {course.picture && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={course.picture}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-medium">{course.title}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'track',
        header: 'TRACKS',
        cell: ({ row }) => getTrackName(row.original.track),
      },
      {
        accessorKey: 'createdAt',
        header: 'DATE JOINED',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const course = row.original
          return (
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                className="h-8 w-8 p-0 bg-[#F9FBFC] flex items-center justify-center cursor-pointer" 
                onClick={() => handleEditCourse(course)}
                disabled={isDeleting === course.id}
              >
                <Edit />
              </Button>
              <Button 
                variant="outline" 
                className="h-8 w-8 p-0 bg-[#F9FBFC] flex items-center justify-center cursor-pointer" 
                onClick={() => handleDeleteCourse(course)}
                disabled={isDeleting === course.id}
              >
                <Trash />
              </Button>
            </div>
          )
        },
      },
    ],
    [isDeleting, getTrackName, handleEditCourse, handleDeleteCourse]
  )

  // Create table instance
  const table = useReactTable({
    data: filteredCourses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

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

        {/* Courses Table */}
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={`px-6 h-14 ${header.id === 'actions' ? 'w-[100px]' : ''}`}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: pagination.pageSize }).map((_, index) => (
                    <TableRow key={index} className="h-[76px]">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex gap-1">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      className={`h-[76px] ${index % 2 === 0 ? "bg-[#F9FBFC]" : ""}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-12 px-6">
                      <p className="text-muted-foreground">
                        {courses.length === 0 ? 'No courses available.' : 'No courses match your search.'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredCourses.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
              <div className="text-sm text-muted-foreground flex-shrink-0">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length} courses
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center gap-1 min-w-0"
                >
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center gap-1 min-w-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
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

    </div>
  )
}