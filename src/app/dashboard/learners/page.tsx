'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Learner, queryKeys, tracksApi, Track } from '@/lib/api'
import LearnerDetailsModal from '@/components/modals/learner-details-modal'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for learners
const mockLearners: Learner[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contact: '+1234567890',
    gender: 'male',
    location: 'New York, USA',
    bio: 'Software engineer with 5 years of experience in React and Node.js',
    trackId: '1',
    amountPaid: 299.99,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    contact: '+1987654321',
    gender: 'female',
    location: 'San Francisco, USA',
    bio: 'UI/UX designer transitioning to frontend development',
    trackId: '2',
    amountPaid: 199.99,
    createdAt: '2023-02-20T14:15:00Z',
    updatedAt: '2023-02-20T14:15:00Z',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    contact: '+1122334455',
    gender: 'male',
    location: 'Chicago, USA',
    bio: 'Recent computer science graduate looking to start career in tech',
    trackId: '1',
    amountPaid: 299.99,
    createdAt: '2023-03-10T09:45:00Z',
    updatedAt: '2023-03-10T09:45:00Z',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    contact: '+1555666777',
    gender: 'female',
    location: 'Austin, USA',
    bio: 'Marketing professional learning to code to better understand digital products',
    trackId: '3',
    amountPaid: 399.99,
    createdAt: '2023-04-05T16:20:00Z',
    updatedAt: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@example.com',
    contact: '+1999888777',
    gender: 'other',
    location: 'Seattle, USA',
    bio: 'Full-stack developer looking to upgrade skills with modern frameworks',
    trackId: '2',
    amountPaid: 199.99,
    createdAt: '2023-05-12T11:10:00Z',
    updatedAt: '2023-05-12T11:10:00Z',
  },
]

// Helper function to map mock trackIds to real tracks
const getMockTrackForLearner = (mockTrackId: string, realTracks: Track[]): Track | undefined => {
  if (!realTracks.length) return undefined
  
  // Map mock trackIds to real tracks by index
  const trackIndex = parseInt(mockTrackId) - 1 // '1' -> 0, '2' -> 1, '3' -> 2
  return realTracks[trackIndex] || realTracks[0] // fallback to first track
}

export default function 
Page() {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // For now, we'll use mock data, but this would normally fetch from API
  const { data: learners = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: () => Promise.resolve(mockLearners), // Replace with learnersApi.getAllLearners when backend is ready
  })

  // Fetch tracks for display
  const { data: tracks = [] } = useQuery({
    queryKey: [queryKeys.tracks.all],
    queryFn: tracksApi.getAllTracks,
  })

  const [filteredLearners, setFilteredLearners] = useState<Learner[]>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Initialize filtered learners with all learners when data is loaded
  useEffect(() => {
    if (learners.length > 0) {
      setFilteredLearners(learners)
    }
  }, [learners])

  // Handle search results
  const handleSearchResults = (results: Learner[]) => {
    setFilteredLearners(results)
  }

  // Function to extract searchable text from learner items
  const getLearnerSearchableText = (learner: Learner): string[] => {
    // const track = tracks.find((t: Track) => t.id === learner.trackId)
    const track = getMockTrackForLearner(learner.trackId || '', tracks)
    return [
      learner.firstName || '',
      learner.lastName || '',
      learner.email || '',
      learner.location || '',
      learner.gender || '',
      track?.name || '',
    ].filter(Boolean)
  }

  const handleViewLearner = useCallback((learner: Learner) => {
    setSelectedLearner(learner)
    setShowDetailsModal(true)
  }, [])

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedLearner(null)
  }

  // Define table columns
  const columns = useMemo<ColumnDef<Learner>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'LEARNERS',
        cell: ({ row }) => {
          const learner = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {learner.firstName.charAt(0)}{learner.lastName.charAt(0)}
              </div>
              <span className="font-medium">{learner.firstName} {learner.lastName}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'email',
        header: 'EMAIL',
        cell: ({ row }) => row.original.email,
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
        accessorKey: 'amountPaid',
        header: 'AMOUNT',
        cell: ({ row }) => `$${row.original.amountPaid.toFixed(2)}`,
      },
      {
        accessorKey: 'gender',
        header: 'GENDER',
        cell: ({ row }) => {
          const gender = row.original.gender
          return gender.charAt(0).toUpperCase() + gender.slice(1)
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const learner = row.original
          return (
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                className="h-8 w-8 p-0 bg-[#F9FBFC] flex items-center justify-center cursor-pointer" 
                onClick={() => handleViewLearner(learner)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [handleViewLearner]
  )

  // Create table instance
  const table = useReactTable({
    data: filteredLearners,
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
          heading="Manage Learners"
          subheading="View learner profiles and track their progress"
          items={[]}
          getSearchableText={getLearnerSearchableText}
          onSearchResults={handleSearchResults}
          searchPlaceholder="Search learners..."
          addButtonText=""
          onAddClick={() => {}}
          isLoading={false}
          showAddButton={false}
        />
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load learners. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PagesHeaders
        heading="Manage Learners"
        subheading="View learner profiles and track their progress"
        items={learners}
        getSearchableText={getLearnerSearchableText}
        onSearchResults={handleSearchResults}
        searchPlaceholder="Search learners by name, email, location..."
        addButtonText=""
        onAddClick={() => {}}
        isLoading={isLoading}
        showAddButton={false}
      />

      <div className='flex flex-col gap-6 mt-6'>

        {/* Learners Table */}
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
                          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
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
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
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
                        {learners.length === 0 ? 'No learners available.' : 'No learners match your search.'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredLearners.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
              <div className="text-sm text-muted-foreground flex-shrink-0">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length} learners
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

      {/* Learner Details Modal */}
      {showDetailsModal && (
        <LearnerDetailsModal
          learner={selectedLearner}
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
          track={selectedLearner?.trackId ? getMockTrackForLearner(selectedLearner.trackId, tracks) : undefined}
        />
      )}

    </div>
  )
}