'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface LearnerGuardProps {
  children: React.ReactNode
}

export default function LearnerGuard({ children }: LearnerGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, token, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      console.log('LearnerGuard - checking auth:', { 
        isAuthenticated, 
        userRole: user?.role,
        token: !!token, 
        isLoading 
      })
      
      // Initial loading check
      if (isLoading) {
        return
      }

      // If no token or not authenticated, redirect to learner login
      if (!token || !isAuthenticated) {
        console.log('LearnerGuard - redirecting to learner login (not authenticated)')
        router.replace('/login')
        return
      }

      // If authenticated but not learner, redirect to admin dashboard
      if (user?.role !== 'learner') {
        console.log('LearnerGuard - redirecting to admin dashboard (not learner)', user?.role)
        router.replace('/admin/dashboard')
        return
      }

      setIsChecking(false)
    }

    // Add a small delay to prevent interference with navigation
    const timer = setTimeout(checkAuth, 50)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, token, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated or not learner, don't render children (will redirect)
  if (!token || !isAuthenticated || user?.role !== 'learner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  // If authenticated learner, render the protected content
  return <>{children}</>
}