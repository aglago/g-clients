'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();
  
  const [verificationOTP, setVerificationOTP] = useState('');
  
  const handleVerify = useCallback(async () => {
    try {
      await verifyEmail(verificationOTP);
      
      // Redirect to login after successful verification
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      // Error is handled by the store
      console.error('Verification error:', error);
    }
  }, [verifyEmail, verificationOTP, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationOTP(value);
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
            <label htmlFor="otp" className="text-body-md">
              OTP Code
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              required
              value={verificationOTP}
              onChange={handleChange}
              placeholder="123456"
              maxLength={6}
              style={{ letterSpacing: '0.5em', textAlign: 'center' }}
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isLoading || !verificationOTP || verificationOTP.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
        </div>
        <div className="text-sm text-center pt-2">
          Didn&apos;t you receive the OTP?{" "}
            <span
              onClick={handleResend}
              className="text-body-md-link text-primary/70 cursor-pointer"
            >
              Resend OTP
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