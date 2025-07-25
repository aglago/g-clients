'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import TrackForm from '@/components/forms/track-form'
import TrackDetailsModal from '@/components/modals/track-details-modal'
import { tracksApi, Track, queryKeys, CreateTrackRequest, UpdateTrackRequest } from '@/lib/api'

export default function TracksPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Fetch tracks using TanStack Query
  const { data: tracks = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.tracks.all],
    queryFn: tracksApi.getAllTracks,
  })

  const [filteredTracks, setFilteredTracks] = useState<Track[]>([])

  // Mutations for CRUD operations
  const createTrackMutation = useMutation({
    mutationFn: tracksApi.createTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
      toast.success('Track created successfully!')
      setShowForm(false)
    },
    onError: () => {
      toast.error('Failed to create track')
    },
  })

  const updateTrackMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrackRequest }) => 
      tracksApi.updateTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
      toast.success('Track updated successfully!')
      setEditingTrack(null)
      setShowForm(false)
    },
    onError: () => {
      toast.error('Failed to update track')
    },
  })

  const deleteTrackMutation = useMutation({
    mutationFn: tracksApi.deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tracks.all] })
      toast.success('Track deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete track')
    },
  })

  // Handle search results
  const handleSearchResults = (results: Track[]) => {
    setFilteredTracks(results)
  }

  // Function to extract searchable text from track items
  const getTrackSearchableText = (track: Track): string[] => {
    return [
      track.name || '',
      track.description || '',
      track.instructor || '',
      `${track.price || 0}`,
      `${track.duration || 0}`,
    ].filter(Boolean)
  }

  const handleAddTrack = () => {
    setEditingTrack(null)
    setShowForm(true)
  }

  const handleEditTrack = (track: Track) => {
    setEditingTrack(track)
    setShowForm(true)
    setShowDetails(false)
  }

  const handleViewTrack = (track: Track) => {
    setSelectedTrack(track)
    setShowDetails(true)
  }

  const handleDeleteTrack = async (track: Track) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      await deleteTrackMutation.mutateAsync(track.id)
    }
  }

  const handleFormSubmit = async (data: CreateTrackRequest | UpdateTrackRequest) => {
    if (editingTrack) {
      await updateTrackMutation.mutateAsync({ 
        id: editingTrack.id, 
        data: data as UpdateTrackRequest 
      })
    } else {
      await createTrackMutation.mutateAsync(data as CreateTrackRequest)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTrack(null)
  }

  if (error) {
    return (
      <div>
        <PagesHeaders
          heading="Manage Tracks"
          subheading="Filter, sort, and access detailed tracks"
          items={[]}
          getSearchableText={getTrackSearchableText}
          onSearchResults={handleSearchResults}
          searchPlaceholder="Search tracks..."
          addButtonText="Add New Track"
          onAddClick={handleAddTrack}
          isLoading={false}
        />
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load tracks. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PagesHeaders
        heading="Manage Tracks"
        subheading="Filter, sort, and access detailed tracks"
        items={tracks}
        getSearchableText={getTrackSearchableText}
        onSearchResults={handleSearchResults}
        searchPlaceholder="Search tracks by name, instructor, description..."
        addButtonText="Add New Track"
        onAddClick={handleAddTrack}
        isLoading={isLoading}
      />

      <div className='flex flex-col gap-6 mt-6'>
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <span>Loading tracks...</span>
          ) : (
            <span>
              Showing {filteredTracks.length} of {tracks.length} track{tracks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded animate-pulse w-20" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredTracks.length > 0 ? (
            // Track cards
            filteredTracks.map((track) => (
              <Card key={track.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{track.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {track.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Instructor: </span>
                      <span>{track.instructor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        <span className="text-muted-foreground">Duration: </span>
                        {track.duration} weeks
                      </span>
                      <span className="font-semibold">
                        ${track.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewTrack(track)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditTrack(track)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            // No results
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {tracks.length === 0 ? 'No tracks available.' : 'No tracks match your search.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Track Form Modal */}
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
            <TrackForm
              track={editingTrack || undefined}
              onSubmit={handleFormSubmit}
              isLoading={createTrackMutation.isPending || updateTrackMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Track Details Modal */}
      <TrackDetailsModal
        track={selectedTrack}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onEdit={handleEditTrack}
        onDelete={handleDeleteTrack}
      />
    </div>
  )
}