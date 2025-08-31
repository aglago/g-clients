"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Track, CreateTrackRequest, UpdateTrackRequest } from '@/lib/api';
import { uploadImageToCloudinary } from '@/lib/upload';
import { toast } from 'sonner';

// Form validation schema
const trackSchema = z.object({
  name: z.string().min(1, 'Track name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().min(1, 'Duration must be at least 1 week'),
  instructor: z.string().min(1, 'Instructor name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type TrackFormData = z.infer<typeof trackSchema>;

interface TrackFormProps {
  track?: Track;
  onSubmit: (data: CreateTrackRequest | UpdateTrackRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function TrackForm({ track, onSubmit, isLoading = false }: TrackFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string>(track?.picture || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Reset selectedFile when track changes (switching between create/edit)
  useEffect(() => {
    setSelectedFile(null);
  }, [track?.id]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: track ? {
      name: track.name,
      price: track.price,
      duration: track.duration,
      instructor: track.instructor,
      description: track.description,
    } : {
      name: '',
      price: 0,
      duration: 1,
      instructor: '',
      description: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File input changed:', file ? file.name : 'No file');
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      // const url = URL.createObjectURL(file);
      // setPreviewUrl(url);
    }
  };

  const handleFormSubmit = async (data: TrackFormData) => {
    let pictureUrl = track?.picture || '';
    
    try {
      // Only upload image to Cloudinary if a new file is selected
      if (selectedFile) {
        console.log('New file selected, uploading to Cloudinary:', selectedFile.name);
        setUploadingImage(true);
        toast.info('Uploading image...');
        
        const uploadResult = await uploadImageToCloudinary(selectedFile, 'tracks');
        pictureUrl = uploadResult.secure_url;
        
        toast.success('Image uploaded successfully!');
      } else {
        console.log('No new file selected, using existing picture URL:', pictureUrl);
      }

      const formData = {
        ...data,
        picture: pictureUrl,
        // Don't include courses in updates to avoid the ObjectId issue
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      if (uploadingImage) {
        toast.error('Failed to upload image. Please try again.');
      } else {
        toast.error('Failed to save track. Please try again.');
      }
    } finally {
      setUploadingImage(false);
    }
  };


  return (
    <Card className="w-full max-w-[495px] mx-auto px-14 py-10">
      <CardHeader className='px-0'>
        <CardTitle>{track ? 'Edit Track' : 'Create New Track'}</CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Track Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Software Engineering"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="299.99"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

             <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="12"
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Input
                id="instructor"
                {...register('instructor')}
                placeholder="e.g., John Doe"
              />
              {errors.instructor && (
                <p className="text-sm text-destructive">{errors.instructor.message}</p>
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
            {/* Image Preview */}
            {/* {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Track preview"
                  className="w-32 h-32 object-cover rounded-md border"
                  onError={() => setPreviewUrl('')}
                />
              </div>
            )} */}
            <p className="text-xs text-muted-foreground">
              Upload an image for the track (JPEG, PNG, WebP)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this track covers..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>


          {/* Form Actions */}
          <div className="pt-4">
            <Button type="submit" disabled={isLoading || uploadingImage} className="w-full py-2.5">
              {uploadingImage ? 'Uploading Image...' : isLoading ? 'Saving...' : track ? 'Update Track' : 'Create Track'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}