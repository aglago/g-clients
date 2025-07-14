'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();
  
  const [verificationToken, setVerificationToken] = useState(token || '');
  
  const handleVerify = useCallback(async () => {
    try {
      await verifyEmail(verificationToken);
      
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
  };
  
  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is required to resend verification');
      return;
    }
    
    try {
      await resendVerification(email);
    } catch (error) {
      // Error is handled by the store
      console.error('Resend verification error:', error);
    }
  };
  
  return (
    <>
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