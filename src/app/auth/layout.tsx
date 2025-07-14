"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageInfo = () => {
    switch (true) {
      case pathname.includes("/auth/register"):
        return {
          title: "Admin Sign up",
          subtitle:
            "Create Your Account to Manage and Access the Dashboard Effortlessly.",
        };
      case pathname.includes("/auth/login"):
        return {
          title: "Admin Login",
          subtitle: "Login to Manage and Access the Dashboard Effortlessly.",
        };
      case pathname.includes("/auth/verify-email"):
        return {
          title: "OTP verification",
          subtitle: "Enter the verification code we sent to your  ",
        };
      case pathname.includes("/auth/forgot-password"):
        return {
          title: "Admin Reset Password",
          subtitle:
            "Enter your email to reset your password",
        };
      case pathname.includes("/auth/reset-password"):
        return {
          title: "Reset Password",
          subtitle: "Enter your new password",
        };
      default:
        return {
          title: "Authentication",
          subtitle: "Please complete the required steps",
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/auth-bg.png')" }}
    >
      <div className="absolute inset-0 bg-white opacity-40 z-0"></div>
      <div className="max-w-[495px] w-full z-20">
        {/* Auth card container */}
        <Card className="bg-white shadow-lg overflow-hidden rounded-lg p-8">
            {/* Logo */}
            <div className="flex justify-center mb-9">
              <Link href="/">
                <div className="inline-block">
                  <Image
                    src="/images/azubi-logo.svg"
                    alt="Logo"
                    width={106}
                    height={30}
                  />
                </div>
              </Link>
            </div>
            <div className="w-full space-y-3">
              <div className="text-center">
                <h3 className="text-heading-h3 pb-2">{title}</h3>
                <p className="text-[18px] text-muted-foreground">{subtitle}</p>
              </div>

              {children}
            </div>
        </Card>
      </div>
    </div>
  );
}
