'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();
  
  const [verificationToken, setVerificationToken] = useState(token || '');
  const [message, setMessage] = useState('');
  
  const handleVerify = useCallback(async () => {
    try {
      await verifyEmail(verificationToken);
      setMessage('Email verified successfully! Redirecting to login...');
      
      // Redirect to login after successful verification
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      // Error is handled by the store
      console.error('Verification error:', error);
    }
  }, [verifyEmail, verificationToken, router]);
  
  // If token is provided in URL, verify automatically
  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token, handleVerify]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationToken(e.target.value);
    if (error) clearError();
  };
  
  const handleResend = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification');
      return;
    }
    
    try {
      await resendVerification(email);
      setMessage('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      // Error is handled by the store
      console.error('Resend verification error:', error);
    }
  };
  
  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="token" className="text-body-md">
              Code
            </label>
            <Input
              id="token"
              name="token"
              type="text"
              required
              value={verificationToken}
              onChange={handleChange}
              placeholder="123456"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isLoading || !verificationToken}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
        </div>
        <div className="text-sm text-center pt-2">
          Didn&apos;t you receive the OPT?{" "}
            <span
              onClick={handleResend}
              className="text-body-md-link text-primary/70 cursor-pointer"
            >
              Resesnd OTP
            </span>
        </div>
      </div>
    </>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}