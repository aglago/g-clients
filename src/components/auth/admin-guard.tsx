'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, token, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      console.log('AdminGuard - checking auth:', { 
        isAuthenticated, 
        userRole: user?.role,
        token: !!token, 
        isLoading 
      })
      
      // Initial loading check
      if (isLoading) {
        return
      }

      // If no token or not authenticated, redirect to admin login
      if (!token || !isAuthenticated) {
        console.log('AdminGuard - redirecting to admin login (not authenticated)')
        router.replace('/admin/login')
        return
      }

      // If authenticated but not admin, redirect to learner homepage
      if (user?.role !== 'admin') {
        console.log('AdminGuard - redirecting to home (not admin)', user?.role)
        router.replace('/')
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

  // If not authenticated or not admin, don't render children (will redirect)
  if (!token || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  // If authenticated admin, render the protected content
  return <>{children}</>
}