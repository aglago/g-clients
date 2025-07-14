"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { email, password } = formData;
      await login(email, password);

      // Redirect to dashboard if login is successful
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the store
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-body-md"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-body-md"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>
        </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-body-md-link text-primary/70"
            >
              Forgot your password?
            </Link>
          </div>

        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <div className="text-sm text-center pt-2">
          Don&apos;t have an account?{" "}
          <span>
            <Link
              href="/auth/register"
              className="text-body-md-link text-primary/70"
            >
              Register
            </Link>
          </span>
        </div>
      </form>
    </>
  );
}
