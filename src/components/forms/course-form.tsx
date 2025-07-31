'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
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


  // Reset selectedFile when course changes (switching between create/edit)
  useEffect(() => {
    setSelectedFile(null)
  }, [course?.id])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('File input changed:', file ? file.name : 'No file')
    if (file) {
      setSelectedFile(file)
      // Clear any picture error since we're uploading a new one
      setPictureError(null)
    }
  }


  const handleFormSubmit = async (data: CourseFormData) => {
    let pictureUrl = course?.picture || ''
    
    try {
      // Only upload image to Cloudinary if a new file is selected
      if (selectedFile) {
        console.log('New file selected, uploading to Cloudinary:', selectedFile.name)
        setUploadingImage(true)
        toast.info('Uploading image...')
        
        const uploadResult = await uploadImageToCloudinary(selectedFile, 'courses')
        pictureUrl = uploadResult.secure_url
        
        toast.success('Image uploaded successfully!')
      } else {
        console.log('No new file selected, using existing picture URL:', pictureUrl)
      }

      // Validate that we have a picture URL (either from upload or existing)
      if (!pictureUrl) {
        setPictureError('Picture is required')
        return
      }

      const formData = {
        ...data,
        picture: pictureUrl,
      }
      
      await onSubmit(formData)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }


  return (
    <Card className="w-full max-w-[495px] mx-auto px-14 py-10">
      <CardHeader className='px-0'>
        <CardTitle>{course ? 'Edit Course' : 'Create New Course'}</CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Introduction to React"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Track Selection */}
          <div className="space-y-2">
            <Label htmlFor="track">Track *</Label>
            <Select
              value={watch('track')}
              onValueChange={(value) => setValue('track', value)}
              disabled={tracksLoading}
            >
              <SelectTrigger className="h-10">
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

          <div className="space-y-2">
            <Label htmlFor="picture">Picture *</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Upload an image for the course (JPEG, PNG, WebP)
            </p>
            {pictureError && (
              <p className="text-sm text-destructive">{pictureError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this course covers..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4">
            <Button type="submit" disabled={isLoading || uploadingImage} className="w-full py-2.5">
              {uploadingImage ? 'Uploading Image...' : isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}