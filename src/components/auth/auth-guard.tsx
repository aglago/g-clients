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
        router.replace('/auth/login')
        return
      }

      setIsChecking(false)
    }

    checkAuth()
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