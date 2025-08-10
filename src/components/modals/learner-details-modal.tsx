'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Calendar, MapPin, User, Phone, Mail, CreditCard, BookOpen } from 'lucide-react'
import { Learner, Track } from '@/lib/api'

interface LearnerDetailsModalProps {
  learner: Learner | null
  isOpen: boolean
  onClose: () => void
  track?: Track
}

export default function LearnerDetailsModal({
  learner,
  isOpen,
  onClose,
  track,
}: LearnerDetailsModalProps) {
  if (!isOpen || !learner) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatGender = (gender: string) => {
    return gender.charAt(0).toUpperCase() + gender.slice(1)
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
            {/* Learner Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {learner.firstName.charAt(0)}{learner.lastName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{learner.firstName} {learner.lastName}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{learner.email}</span>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined: {formatDate(learner.createdAt)}</span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{learner.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{learner.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{formatGender(learner.gender)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="font-medium">${learner.amountPaid.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Information */}
            {track && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Enrolled Track</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">{track.name}</h4>
                  </div>
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
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Bio</h3>
              <p className="text-muted-foreground leading-relaxed">
                {learner.bio}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}