'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { uploadImageToCloudinary } from '@/lib/upload'
import { CreateCourseRequest, UpdateCourseRequest, Course, tracksApi, queryKeys, Track } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  track: z.string().min(1, 'Track is required'),
  picture: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
})

type CourseFormData = z.infer<typeof courseFormSchema>

interface CourseFormProps {
  course?: Course
  onSubmit: (data: CreateCourseRequest | UpdateCourseRequest) => Promise<void>
  isLoading?: boolean
}

export default function CourseForm({ course, onSubmit, isLoading = false }: CourseFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pictureError, setPictureError] = useState<string | null>(null)

  // Fetch tracks for selection
  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: [queryKeys.tracks.all],
    queryFn: tracksApi.getAllTracks,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || '',
      track: course?.track || '',
      picture: course?.picture || '',
      description: course?.description || '',
    },
  })

  const watchedPicture = watch('picture')

  // Reset selectedFile when course changes (for edit mode)
  useEffect(() => {
    if (course) {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }, [course])

  // Update preview URL when picture value changes
  useEffect(() => {
    if (watchedPicture && !selectedFile) {
      setPreviewUrl(watchedPicture)
    }
  }, [watchedPicture, selectedFile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      
      // Clear any picture error since we're uploading a new one
      setPictureError(null)
      
      // Clear the current picture value since we're uploading a new one
      setValue('picture', '')
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setValue('picture', '')
    
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleFormSubmit = async (data: CourseFormData) => {
    let pictureUrl = course?.picture || '';
    
    try {
      // Upload image if a new file is selected
      if (selectedFile) {
        setUploadingImage(true)
        const uploadResult = await uploadImageToCloudinary(selectedFile, 'courses')
        pictureUrl = uploadResult.secure_url
        setUploadingImage(false)
      }

      // Validate that we have a picture URL (either from upload or existing)
      if (!pictureUrl) {
        setPictureError('Picture is required')
        return
      }

      setPictureError(null)

      const submitData = {
        ...data,
        picture: pictureUrl,
      }

      await onSubmit(submitData)
      
      // Reset form after successful submission
      if (!course) {
        reset()
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    } catch (error) {
      setUploadingImage(false)
      console.error('Error submitting form:', error)
    }
  }

  const isSubmitDisabled = isLoading || uploadingImage

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-center">
          {course ? 'Edit Course' : 'Add New Course'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter course title"
              disabled={isSubmitDisabled}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Track Selection */}
          <div className="space-y-2">
            <Label htmlFor="track">Track</Label>
            <Select
              value={watch('track')}
              onValueChange={(value) => setValue('track', value)}
              disabled={isSubmitDisabled || tracksLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track: Track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.track && (
              <p className="text-sm text-destructive">{errors.track.message}</p>
            )}
          </div>

          {/* Picture Upload */}
          <div className="space-y-2">
            <Label>Course Picture</Label>
            
            {/* File Input */}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitDisabled}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isSubmitDisabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Course preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Upload Status */}
            {uploadingImage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image...
              </div>
            )}

            {/* Validation Error */}
            {(errors.picture || pictureError) && (
              <p className="text-sm text-destructive">{errors.picture?.message || pictureError}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter course description"
              disabled={isSubmitDisabled}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitDisabled}
          >
            {isSubmitDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading...' : course ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {course ? 'Update Course' : 'Create Course'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}