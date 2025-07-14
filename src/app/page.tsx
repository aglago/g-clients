'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

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