'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CreateInvoiceRequest, UpdateInvoiceRequest, Invoice, queryKeys, Learner } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const invoiceFormSchema = z.object({
  learnerId: z.string().min(1, 'Learner is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'unpaid', 'cancelled'], {
    message: 'Status is required',
  }),
  paymentDetails: z.string().min(1, 'Payment details are required'),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: CreateInvoiceRequest | UpdateInvoiceRequest) => Promise<void>
  isLoading?: boolean
}

// Mock learners data (same as in learners page)
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

export default function InvoiceForm({ invoice, onSubmit, isLoading = false }: InvoiceFormProps) {
  // For now, we'll use mock data, but this would normally fetch from API
  const { data: learners = [], isLoading: learnersLoading } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: () => Promise.resolve(mockLearners), // Replace with learnersApi.getAllLearners when backend is ready
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      learnerId: invoice?.learnerId || '',
      amount: invoice?.amount || 0,
      dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : '', // Format for date input
      status: invoice?.status || 'unpaid',
      paymentDetails: invoice?.paymentDetails || '',
    },
  })

  const handleFormSubmit = async (data: InvoiceFormData) => {
    const formData = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(), // Convert to ISO string
    }
    
    await onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-[495px] mx-auto px-14 py-10">
      <CardHeader className='px-0'>
        <CardTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Learner Selection */}
          <div className="space-y-2">
            <Label htmlFor="learnerId">Select Learner *</Label>
            <Select
              value={watch('learnerId')}
              onValueChange={(value) => setValue('learnerId', value)}
              disabled={learnersLoading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={learnersLoading ? "Loading learners..." : `Select a learner (${learners.length} available)`} />
              </SelectTrigger>
              <SelectContent>
                {learners.length === 0 ? (
                  <SelectItem value="" disabled>
                    No learners available
                  </SelectItem>
                ) : (
                  learners.map((learner: Learner) => (
                    <SelectItem key={learner.id} value={learner.id}>
                      {learner.firstName} {learner.lastName} ({learner.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.learnerId && (
              <p className="text-sm text-destructive">{errors.learnerId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              placeholder="299.99"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watch('status')}
              onValueChange={(value: 'paid' | 'unpaid' | 'cancelled') => setValue('status', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <Label htmlFor="paymentDetails">Payment Details *</Label>
            <Textarea
              id="paymentDetails"
              {...register('paymentDetails')}
              placeholder="e.g., Payment for React Development Course enrollment"
              rows={3}
            />
            {errors.paymentDetails && (
              <p className="text-sm text-destructive">{errors.paymentDetails.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full py-2.5">
              {isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}