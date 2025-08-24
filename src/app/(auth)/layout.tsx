import type { Metadata } from "next";
import Image from "next/image";
import LearnerHeader from "@/components/learner/learner-header";
import LearnerFooter from "@/components/learner/learner-footer";

export const metadata: Metadata = {
  title: "Authentication - LearnHub",
  description: "Sign in to your LearnHub account",
};

export default function LearnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LearnerHeader />
      <div className="flex min-h-[75vh] max-w-7xl mx-auto">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="/images/learner/auth/auth-left.svg"
            alt="Learning"
            fill
            className="object-contain"
          />
        </div>

        {children}
      </div>
      <LearnerFooter />
    </>
  );
}
