'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface GuestGuardProps {
  children: React.ReactNode
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter()
  const { isAuthenticated, token, isLoading } = useAuthStore()

  useEffect(() => {
    // Don't redirect while still loading the auth state
    if (isLoading) return

    // If authenticated, redirect to dashboard
    if (token && isAuthenticated) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, token, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated, don't render children (will redirect)
  if (token && isAuthenticated) {
    return null
  }

  // If not authenticated, render the auth content
  return <>{children}</>
}