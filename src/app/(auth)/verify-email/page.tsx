'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';

function VerifyEmailPageContent() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authApi.verifyEmail({ otp });
      if (result.success) {
        toast.success('Email verified successfully!');
        router.push('/login');
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please try registering again.');
      return;
    }

    setIsResending(true);
    try {
      const result = await authApi.resendVerification({ email });
      if (result.success) {
        toast.success('Verification code sent!');
      } else {
        toast.error(result.message || 'Failed to resend code');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
     <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center"> <div className="text-center mb-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/images/azubi-logo.svg"
                    alt="Logo"
                    width={150}
                    height={50}
                    className="mx-auto"
                  />
                </Link>
                <p className="text-gray-600">
              {email && (
                <p className="text-center text-gray-600 mt-2">
                  We sent a code to <span className="font-medium">{email}</span>
                </p>
              )}
                </p>
              </div></CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="mt-1 text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <Link
                  href="/register"
                  className="text-primary hover:text-blue-500"
                >
                  ← Back to Registration
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}