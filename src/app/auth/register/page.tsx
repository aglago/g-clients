"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterAdmin() {
  const router = useRouter();
  const { registerAdmin, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { firstName, lastName, email, password, confirmPassword, contact } =
        formData;
      await registerAdmin(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        contact
      );

      // Redirect to verification page if registration is successful
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      // Error is handled by the store
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md space-y-3">
          <div>
            <label htmlFor="firstName" className="text-body-md">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="text-body-md">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-body-md">
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
            <label htmlFor="password" className="text-body-md">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-body-md">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
            />
          </div>

          <div>
            <label htmlFor="contact" className="text-body-md">
              Contact Number
            </label>
            <Input
              id="contact"
              name="contact"
              type="text"
              required
              value={formData.contact}
              onChange={handleChange}
              placeholder="Contact Number (e.g. +233241333224)"
            />
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </div>

        <div className="text-sm text-center">
          Already have an account?{" "}
          <span>
            <Link
              href="/auth/login"
              className="text-body-md-link text-primary/70"
            >
              Login
            </Link>
          </span>
        </div>
      </form>
    </>
  );
}
