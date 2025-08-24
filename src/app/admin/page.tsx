'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AdminHome() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Only redirect if we're actually on the admin path and not loading
    if (pathname !== '/admin' || isLoading) return;
    
    // Add a small delay to ensure we don't interfere with direct page loads
    const timer = setTimeout(() => {
      // Redirect based on authentication status
      if (isAuthenticated) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">G-Clients Admin</h2>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}