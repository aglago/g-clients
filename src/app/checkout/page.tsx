"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { tracksApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, CreditCard, AlertCircle, User } from "lucide-react";
import LearnerHeader from "@/components/learner/learner-header";
import { useAuthStore } from "@/stores/authStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  location: string;
  password: string;
  confirmPassword: string;
}

function CheckoutPageContent() {
  const { setAuthData, isAuthenticated, user } = useAuthStore();
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "existing-user" | "payment">("info");
  const [existingUser, setExistingUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const trackSlug = searchParams.get("track");

  // Get track details
  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ["tracks", "slug", trackSlug],
    queryFn: () =>
      trackSlug
        ? tracksApi.getTrackBySlug(trackSlug)
        : Promise.reject("No track specified"),
    enabled: !!trackSlug,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!trackSlug) {
      toast.error("No track specified for checkout");
      router.push("/tracks");
      return;
    }

    // If user is authenticated, prefill their information
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        // Skip password fields for authenticated users
        password: "",
        confirmPassword: "",
      }));
      
      // Show a toast that they're logged in
      toast.success(`Welcome back, ${user.firstName}! Your information has been prefilled.`);
    }
  }, [trackSlug, router, isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as "male" | "female" | "other",
    }));
  };

  const validateForm = (skipPasswordValidation = false): boolean => {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      location,
      password,
      confirmPassword,
    } = formData;

    // Basic field validation (always required)
    if (!firstName || !lastName || !email || !phone || !gender || !location) {
      toast.error("Please fill in all required fields");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation (skip for existing user detection)
    if (!skipPasswordValidation) {
      if (!password || !confirmPassword) {
        toast.error("Password fields are required");
        return false;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return { exists: false, user: null };
    } catch (error) {
      console.error('Email check failed:', error);
      return { exists: false, user: null };
    }
  };

  const handleProceedToPayment = async () => {
    // If user is already authenticated, skip validation and go directly to payment
    if (isAuthenticated && user) {
      setStep("payment");
      return;
    }

    // First validate basic fields (skip password for existing user detection)
    if (!validateForm(true)) {
      return;
    }

    setIsLoading(true);
    try {
      // Check if user already exists
      const emailCheck = await checkEmailExists(formData.email);
      
      if (emailCheck.exists) {
        setExistingUser(emailCheck.user);
        setStep("existing-user");
      } else {
        // For new users, validate password fields before proceeding
        if (!validateForm(false)) {
          setIsLoading(false);
          return;
        }
        setStep("payment");
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(`/checkout?track=${trackSlug}`);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleCompletePayment = async () => {
    setIsLoading(true);
    try {
      // Step 1: Process payment with payment gateway
      // TODO: Integrate with actual payment gateway (Paystack, Stripe, etc.)
      const paymentResult = await simulatePayment();

      // Step 2: Process checkout - use appropriate endpoint based on authentication
      let response;
      
      if (isAuthenticated && user) {
        // User is authenticated - use authenticated endpoint
        const checkoutData = {
          trackSlug: trackSlug!,
          paymentSuccess: paymentResult.success,
          paymentDetails: paymentResult.details,
        };

        response = await fetch("/api/checkout/authenticated", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${useAuthStore.getState().token}`
          },
          body: JSON.stringify(checkoutData),
        });
      } else {
        // User is not authenticated - use regular endpoint (for new users only)
        const checkoutData = {
          trackSlug: trackSlug!,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          location: formData.location,
          password: formData.password,
          paymentSuccess: paymentResult.success,
          paymentDetails: paymentResult.details,
        };

        response = await fetch("/api/checkout/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        });
      }

      const result = await response.json();

      if (result.success) {
        // Handle auto-login if indicated
        if (result.autoLogin && result.token) {
          // Auto-login the user with the provided token
          setAuthData(result.user, result.token);
          toast.success("You have been automatically logged in!");
        }

        if (paymentResult.success) {
          // Payment successful - show success toast and redirect to portal
          toast.success("🎉 Enrollment successful! Welcome to your learning journey!");
          
          // Redirect to portal for all successful enrollments
          setTimeout(() => {
            router.push('/portal');
          }, 1500); // Short delay to show the toast
        } else {
          // Payment failed but account created - show info and redirect to login
          toast.error("Payment failed, but your account was created. Please try again from your portal.");
          
          // Redirect to login if not authenticated, or portal if authenticated
          setTimeout(() => {
            if (isAuthenticated) {
              router.push('/portal');
            } else {
              router.push('/login');
            }
          }, 2000);
        }
      } else {
        // Handle backend rejection of existing users
        if (result.existingUser && result.requiresAuthentication) {
          toast.error('Please login to your existing account to continue with checkout.');
          // Redirect to login with return URL
          const returnUrl = encodeURIComponent(`/checkout?track=${trackSlug}`);
          router.push(`/login?returnUrl=${returnUrl}`);
        } else {
          toast.error(result.message || "Checkout failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout processing");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate payment for now - replace with actual payment gateway integration
  const simulatePayment = async (): Promise<{
    success: boolean;
    message?: string;
    details?: Record<string, unknown>;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random success/failure for testing
        const success = Math.random() > 0.3; // 70% success rate
        resolve({
          success,
          message: success
            ? "Payment successful"
            : "Payment failed - insufficient funds",
          details: {
            transactionId: success ? `txn_${Date.now()}` : null,
            method: "card",
            amount: track?.price,
            currency: "USD",
            timestamp: new Date().toISOString(),
          },
        });
      }, 2000);
    });
  };

  if (trackLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Track Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The track you&apos;re trying to enroll in doesn&apos;t exist.
          </p>
          <Link href="/tracks">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tracks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/tracks">Tracks</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/tracks/${track.slug}`}>
                  {track.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center ${
                step === "info" ? "text-primary" : "text-primary"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === "info"
                    ? "bg-primary text-white"
                    : "bg-primary text-white"
                }`}
              >
                {step === "existing-user" || step === "payment" ? "✓" : "1"}
              </div>
              <span className="ml-3 font-medium text-lg">Your Information</span>
            </div>
            <div
              className={`w-24 h-1 rounded ${
                step === "payment" ? "bg-primary" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                step === "payment" ? "text-primary" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === "payment"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-3 font-medium text-lg">
                {step === "existing-user" ? "Account Verification" : "Payment"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "info" ? (
              <Card className="shadow-sm border">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl">
                    <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
                    Your Information
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    We&apos;ll create your account automatically after payment.
                    You can change your password later.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your login email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <>
                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Account Password
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="password">Password *</Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Minimum 6 characters"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">
                              Confirm Password *
                            </Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm your password"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-6">
                    <Link href={`/tracks/${track.slug}`}>
                      <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Track
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : step === "existing-user" ? (
              <Card className="shadow-sm border">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl">
                    <User className="w-6 h-6 mr-3 text-orange-600" />
                    Account Already Exists
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    We found an existing account with this email address.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-orange-900 mb-2">
                          Account Found: {existingUser?.firstName} {existingUser?.lastName}
                        </h3>
                        <p className="text-orange-800 text-sm">
                          For security reasons, we cannot process payments for existing accounts without authentication.
                          This protects your account from unauthorized charges.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Choose how to proceed:</h3>
                    
                    <div className="grid gap-4">
                      <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={handleGoToLogin}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Login to Your Account</h4>
                            <p className="text-sm text-gray-600">
                              Recommended: Login to safely complete your enrollment
                            </p>
                          </div>
                          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-500">Continue as Guest</h4>
                          <p className="text-sm text-gray-500">
                            Not available for security reasons. Existing accounts must authenticate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setStep("info")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Information
                    </Button>
                    <Button onClick={handleGoToLogin} className="px-8">
                      Login to Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="w-6 h-6 mr-3 text-primary" />
                    Payment Information
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Complete your enrollment with secure payment processing.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment form would go here - for now showing placeholder */}
                  <div className="space-y-4">
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Payment Gateway Integration
                      </p>
                      <p className="text-gray-600 mb-6">
                        Integrate with Paystack, Stripe, or other payment
                        providers here
                      </p>
                      <div className="max-w-xs mx-auto text-left space-y-2 text-sm text-gray-600">
                        <div>• Card payments (Visa, Mastercard, Amex)</div>
                        <div>• Bank transfers</div>
                        <div>• Digital wallets</div>
                        <div>• Mobile money</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setStep("info")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={track.picture || "/placeholder-course.jpg"}
                      alt={track.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {track.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      By {track.instructor}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {track.duration} weeks
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Track Price</span>
                    <span className="font-semibold">${track.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">${track.price}</span>
                </div>
                <Separator />

                {step == "info" ? (
                  <Button onClick={handleProceedToPayment} className="px-8">
                    Proceed to Payment
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompletePayment}
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading
                      ? "Processing..."
                      : `Complete Payment - $${track.price}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
