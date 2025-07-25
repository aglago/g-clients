'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Edit, Trash2, Calendar, Tag } from 'lucide-react'
import Image from 'next/image'
import { Course, tracksApi, queryKeys } from '@/lib/api'

interface CourseDetailsModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

export default function CourseDetailsModal({
  course,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CourseDetailsModalProps) {
  // Fetch track details
  const { data: track } = useQuery({
    queryKey: [queryKeys.tracks.detail(course?.track || '')],
    queryFn: () => tracksApi.getTrackById(course?.track || ''),
    enabled: !!course?.track,
  })

  if (!isOpen || !course) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-6 top-6 z-10 p-1 h-auto w-auto bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-6 w-8 text-[#7F7E83]" />
          <span className="sr-only">Close</span>
        </Button>

        <Card className="mx-4">
          <CardContent className="p-6">
            {/* Course Image */}
            {course.picture && (
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={course.picture}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Course Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              
              {/* Track Info */}
              {track && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Tag className="h-4 w-4" />
                  <span>Track: {track.name}</span>
                </div>
              )}

              {/* Dates */}
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(course.createdAt)}</span>
                </div>
                {course.updatedAt !== course.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {formatDate(course.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Track Details (if available) */}
            {track && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Track Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="ml-2 font-medium">{track.instructor}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{track.duration} weeks</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-medium">${track.price}</span>
                  </div>
                  {track.rating && track.rating > 0 && (
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-2 font-medium">
                        {track.rating}/5 ({track.reviewsCount || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onEdit(course)}
                className="flex-1"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>
              <Button
                onClick={() => onDelete(course)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}