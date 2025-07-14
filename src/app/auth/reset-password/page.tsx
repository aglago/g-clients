'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  
  // Redirect if no token is provided in URL
  useEffect(() => {
    if (!tokenFromUrl) {
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/auth/forgot-password');
      }, 3000);
    }
  }, [tokenFromUrl, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenFromUrl) {
      setMessage('Missing reset token. Please request a new password reset link.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    try {
      const { password, confirmPassword } = formData;
      await resetPassword(tokenFromUrl, password, confirmPassword);
      
      setMessage('Password has been reset successfully. Redirecting to login...');
      
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      // Error is handled by the store
      console.error('Reset password error:', error);
    }
  };
  
  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {message && (
        <div className={`${
          message.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        } px-4 py-3 rounded border mb-6`}>
          {message}
        </div>
      )}
      
      {!tokenFromUrl ? (
        <div className="text-center py-4">
          <p className="text-gray-700 mb-4">Please check your email for a password reset link.</p>
          <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
          
         <div className="text-sm text-center pt-2">
         Back to homepage, {" "} 
          <span>
            <Link
              href="/"
              className="text-body-md-semibold hover:underline text-primary cursor-pointer"
            >
              Back
            </Link>
          </span>
        </div>
        </form>
      )}
    </>
  );
}