"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
    } catch (error) {
      // Error is handled by the store
      console.error("Forgot password error:", error);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="text-body-md">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleChange}
              placeholder="Email address"
            />
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isLoading || !email}>
            {isLoading ? "Sending..." : "Reset Password"}
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
    </>
  );
}
