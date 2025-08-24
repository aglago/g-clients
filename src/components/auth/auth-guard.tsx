'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, token, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      console.log('AuthGuard - checking auth:', { isAuthenticated, token: !!token, isLoading })
      
      // Initial loading check
      if (isLoading) {
        return
      }

      // If no token or not authenticated, redirect to login
      if (!token || !isAuthenticated) {
        console.log('AuthGuard - redirecting to login')
        // Only redirect if we're not already on an auth page
        if (!window.location.pathname.startsWith('/admin/')) {
          router.replace('/admin/login')
        }
        return
      }

      setIsChecking(false)
    }

    // Add a small delay to prevent interference with navigation
    const timer = setTimeout(checkAuth, 50)
    return () => clearTimeout(timer)
  }, [isAuthenticated, token, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, don't render children (will redirect)
  if (!token || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render the protected content
  return <>{children}</>
}