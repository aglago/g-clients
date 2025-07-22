'use client'

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SearchRef } from '@/components/ui/search'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { invoicesApi, Invoice, queryKeys, learnersApi } from '@/lib/api'

export default function InvoicesSearchExample() {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const searchRef = useRef<SearchRef>(null)

  // Fetch invoices and learners using TanStack Query
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: [queryKeys.invoices.all],
    queryFn: invoicesApi.getAllInvoices,
  })

  const { data: learners = [] } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: learnersApi.getAllLearners,
  })

  // Create a map for quick learner lookup
  const learnersMap = learners.reduce((acc, learner) => {
    acc[learner.id] = learner
    return acc
  }, {} as Record<string, typeof learners[0]>)

  // Update filtered invoices when invoices data changes
  useState(() => {
    setFilteredInvoices(invoices)
  }, [invoices])

  // Handle search results
  const handleSearchResults = (results: Invoice[]) => {
    setFilteredInvoices(results)
  }

  // Function to extract searchable text from invoice items
  const getInvoiceSearchableText = (invoice: Invoice): string[] => {
    const learner = learnersMap[invoice.learnerId]
    return [
      invoice.id || '',
      invoice.status || '',
      `${invoice.amount || 0}`, // Convert amount to string
      invoice.courseId || '',
      invoice.trackId || '',
      // Include learner information in search
      learner?.firstName || '',
      learner?.lastName || '',
      learner?.email || '',
      // Format payment date for searching
      invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '',
      // Format created date
      new Date(invoice.createdAt).toLocaleDateString(),
    ].filter(Boolean)
  }

  const handleClearSearch = () => {
    searchRef.current?.clear()
  }

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (invoicesError) {
    return <div className="text-center py-8 text-destructive">Failed to load invoices.</div>
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full max-w-md">
          <Search
            ref={searchRef}
            items={invoices}
            getSearchableText={getInvoiceSearchableText}
            onSearchResults={handleSearchResults}
            placeholder="Search invoices by ID, learner, amount, status..."
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearSearch}>
            Clear Search
          </Button>
          <Button>Create Invoice</Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {invoicesLoading ? (
          <span>Loading invoices...</span>
        ) : (
          <span>
            Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Invoices Table/List */}
      <div className="space-y-4">
        {invoicesLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-20" />
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredInvoices.length > 0 ? (
          // Invoice cards
          filteredInvoices.map((invoice) => {
            const learner = learnersMap[invoice.learnerId]
            return (
              <Card key={invoice.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">Invoice #{invoice.id}</h3>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {learner && (
                        <p>
                          <span className="font-medium">Learner:</span> {learner.firstName} {learner.lastName} ({learner.email})
                        </p>
                      )}
                      
                      <p>
                        <span className="font-medium">Created:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                      
                      {invoice.paymentDate && (
                        <p>
                          <span className="font-medium">Paid:</span> {new Date(invoice.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                      
                      {invoice.courseId && (
                        <p>
                          <span className="font-medium">Course ID:</span> {invoice.courseId}
                        </p>
                      )}
                      
                      {invoice.trackId && (
                        <p>
                          <span className="font-medium">Track ID:</span> {invoice.trackId}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="text-lg font-semibold">
                      ${invoice.amount}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          // No results
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {invoices.length === 0 ? 'No invoices available.' : 'No invoices match your search.'}
            </p>
            {searchRef.current?.getValue() && (
              <Button variant="link" onClick={handleClearSearch} className="mt-2">
                Clear search to see all invoices
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}