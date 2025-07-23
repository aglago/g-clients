"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, DollarSign, User, Calendar, BookOpen } from 'lucide-react';
import { Track, coursesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface TrackDetailsModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

export default function TrackDetailsModal({
  track,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TrackDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses to display course names
  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAllCourses,
  });

  if (!track) return null;

  const getCourseName = (courseId: string) => {
    return allCourses.find(course => course.id === courseId)?.title || 'Unknown Course';
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(track);
      onClose();
    } catch (error) {
      console.error('Failed to delete track:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{track.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Track Image */}
          {track.picture && (
            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden relative">
              <Image
                src={track.picture}
                alt={track.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  console.log('Failed to load image:', track.picture);
                }}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          )}

          {/* Track Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">${track.price}</p>
                <p className="text-sm text-muted-foreground">Price</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{track.duration}</p>
                <p className="text-sm text-muted-foreground">Weeks</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{track.rating || 0}</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{track.courses?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </CardContent>
            </Card>
          </div>

          {/* Track Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Instructor
              </h3>
              <p className="text-muted-foreground">{track.instructor}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{track.description}</p>
            </div>

            {/* Courses in Track */}
            {track.courses && track.courses.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Courses in this Track</h3>
                <div className="flex flex-wrap gap-2">
                  {track.courses.map((courseId) => (
                    <Badge key={courseId} variant="secondary">
                      {getCourseName(courseId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Summary */}
            {(track.rating || track.reviewsCount) && (
              <div>
                <h3 className="font-semibold mb-2">Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{track.rating || 0}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({track.reviewsCount || 0} review{(track.reviewsCount || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}

            {/* Track Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(track.createdAt).toLocaleDateString()}</span>
              </div>
              {track.updatedAt !== track.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {new Date(track.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            {onEdit && (
              <Button onClick={() => onEdit(track)} className="flex-1">
                Edit Track
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Track'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}