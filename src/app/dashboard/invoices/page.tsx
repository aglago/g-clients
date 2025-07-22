'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PagesHeaders from '@/components/dashboard/pages-headers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { invoicesApi, Invoice, queryKeys, learnersApi } from '@/lib/api'

export default function InvoicesPage() {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])

  // Fetch invoices and learners using TanStack Query
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: [queryKeys.invoices.all],
    queryFn: invoicesApi.getAllInvoices,
  })

  const { data: learners = [], isLoading: learnersLoading } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: learnersApi.getAllLearners,
  })

  // Create a map for quick learner lookup
  const learnersMap = learners.reduce((acc, learner) => {
    acc[learner.id] = learner
    return acc
  }, {} as Record<string, typeof learners[0]>)

  const isLoading = invoicesLoading || learnersLoading

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
      `${invoice.amount || 0}`,
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

  const handleAddInvoice = () => {
    // TODO: Implement add invoice functionality
    console.log('Add new invoice clicked')
  }

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'default' as const
      case 'pending':
        return 'secondary' as const
      case 'cancelled':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  if (invoicesError) {
    return (
      <div>
        <PagesHeaders
          heading="Manage Invoices"
          subheading="Filter, sort, and access detailed invoices"
          items={[]}
          getSearchableText={getInvoiceSearchableText}
          onSearchResults={handleSearchResults}
          searchPlaceholder="Search invoices..."
          addButtonText="Create Invoice"
          onAddClick={handleAddInvoice}
          isLoading={false}
        />
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load invoices. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PagesHeaders
        heading="Manage Invoices"
        subheading="Filter, sort, and access detailed invoices"
        items={invoices}
        getSearchableText={getInvoiceSearchableText}
        onSearchResults={handleSearchResults}
        searchPlaceholder="Search invoices by ID, learner, amount, status..."
        addButtonText="Create Invoice"
        onAddClick={handleAddInvoice}
        isLoading={isLoading}
      />

      <div className='flex flex-col gap-6 mt-6'>
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <span>Loading invoices...</span>
          ) : (
            <span>
              Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded animate-pulse w-20" />
                    <div className="h-8 bg-muted rounded animate-pulse w-24" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredInvoices.length > 0 ? (
            // Invoice cards
            filteredInvoices.map((invoice) => {
              const learner = learnersMap[invoice.learnerId]
              return (
                <Card key={invoice.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">Invoice #{invoice.id}</h3>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {learner ? (
                          <div className="flex items-center gap-4">
                            <span>
                              <span className="font-medium text-foreground">Learner:</span> {learner.firstName} {learner.lastName}
                            </span>
                            <span>
                              <span className="font-medium text-foreground">Email:</span> {learner.email}
                            </span>
                          </div>
                        ) : (
                          <p>
                            <span className="font-medium text-foreground">Learner ID:</span> {invoice.learnerId}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <span>
                            <span className="font-medium text-foreground">Created:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                          </span>
                          
                          {invoice.paymentDate && (
                            <span>
                              <span className="font-medium text-foreground">Paid:</span> {new Date(invoice.paymentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {invoice.courseId && (
                            <span>
                              <span className="font-medium text-foreground">Course:</span> {invoice.courseId}
                            </span>
                          )}
                          
                          {invoice.trackId && (
                            <span>
                              <span className="font-medium text-foreground">Track:</span> {invoice.trackId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-3">
                      <div className="text-2xl font-bold text-foreground">
                        ${invoice.amount}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                        {invoice.status === 'pending' && (
                          <Button size="sm">Mark Paid</Button>
                        )}
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
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!isLoading && filteredInvoices.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${filteredInvoices
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.amount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ${filteredInvoices
                    .filter(inv => inv.status === 'pending')
                    .reduce((sum, inv) => sum + inv.amount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ${filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}