'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateInvoiceRequest, UpdateInvoiceRequest, Invoice, queryKeys, Learner, learnersApi } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

const invoiceFormSchema = z.object({
  learnerId: z.string().min(1, 'Learner is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'unpaid', 'cancelled'], {
    message: 'Status is required',
  }),
  transactionId: z.string().optional(),
  paymentMethod: z.string().optional(),
  currency: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: CreateInvoiceRequest | UpdateInvoiceRequest) => Promise<void>
  isLoading?: boolean
}


export default function InvoiceForm({ invoice, onSubmit, isLoading = false }: InvoiceFormProps) {
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  const { data: learners = [], isLoading: learnersLoading } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: learnersApi.getAllLearners,
  })

  // Parse existing payment details if editing
  const parsePaymentDetails = (paymentDetails: string | object) => {
    try {
      const parsed = typeof paymentDetails === 'string' ? JSON.parse(paymentDetails) : paymentDetails;
      return {
        transactionId: parsed?.transactionId || '',
        paymentMethod: parsed?.method || '',
        currency: parsed?.currency || 'USD',
      };
    } catch {
      return { transactionId: '', paymentMethod: '', currency: 'USD' };
    }
  };

  const existingPaymentDetails = invoice?.paymentDetails ? parsePaymentDetails(invoice.paymentDetails) : { transactionId: '', paymentMethod: '', currency: 'USD' };


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      learnerId: '',
      amount: invoice?.amount || 0,
      dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : '', // Format for date input
      status: invoice?.status || 'unpaid',
      transactionId: existingPaymentDetails.transactionId,
      paymentMethod: existingPaymentDetails.paymentMethod,
      currency: existingPaymentDetails.currency,
    },
  })

  // Update learnerId when learners data is loaded and we have an invoice
  useEffect(() => {
    if (invoice?.learnerId && learners.length > 0) {
      // Find the matching learner by email (since learnerId is populated with email)
      const matchingLearner = learners.find(l => l.email === invoice.learnerId);
      if (matchingLearner) {
        setValue('learnerId', matchingLearner.id);
      }
    }
  }, [invoice, learners, setValue]);

  const handleFormSubmit = async (data: InvoiceFormData) => {
    // Build paymentDetails JSON from individual fields
    const paymentDetails = JSON.stringify({
      transactionId: data.transactionId || '',
      method: data.paymentMethod || '',
      currency: data.currency || 'USD',
      timestamp: new Date().toISOString()
    });

    const formData = {
      learnerId: data.learnerId,
      amount: data.amount,
      dueDate: new Date(data.dueDate).toISOString(),
      status: data.status,
      paymentDetails
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
                  <SelectItem value="no-learners" disabled>
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

          {/* Payment Details - Collapsible */}
          <Collapsible open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <Label className="text-base font-medium cursor-pointer">Payment Details</Label>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isPaymentDetailsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    {...register('transactionId')}
                    placeholder="e.g., txn_1756046196397"
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={watch('paymentMethod')}
                    onValueChange={(value) => setValue('paymentMethod', value)}
                    disabled
                  >
                    <SelectTrigger className="h-10 bg-muted">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                  disabled
                >
                  <SelectTrigger className="h-10 bg-muted">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

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