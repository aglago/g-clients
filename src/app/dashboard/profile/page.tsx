"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import PagesHeaders from "@/components/dashboard/pages-headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

// Form schemas
const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  contact: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const { user, updatePassword, updateProfile } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      contact: user?.contact || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  });

  // Handle profile image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setProfileImage(data.secure_url);

      // Update profile with new image
      if (user) {
        await updateProfile(
          user.firstName,
          user.lastName,
          user.contact,
          data.secure_url
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle profile update
  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSavingProfile(true);
      await updateProfile(data.firstName, data.lastName, data.contact);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Profile update error:", error);
      // Error handling is done in the store
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsUpdatingPassword(true);
      await updatePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword
      );
      passwordForm.reset();
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Password update error:", error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Get initials for profile image placeholder
  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${
      user.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div>
      <PagesHeaders
        heading="Profile Settings"
        subheading="Manage your account information and preferences"
        items={[]}
        getSearchableText={() => []}
        onSearchResults={() => {}}
        searchPlaceholder=""
        addButtonText=""
        onAddClick={() => {}}
        isLoading={false}
        showAddButton={false}
        showSearch={false}
      />

      <div className="flex justify-center mt-6">
        <div className="w-full max-w-2xl">
          <Card className="bg-white shadow-sm">
            <CardContent className="py-8 px-24">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold mt-4">
                  {user ? `${user.firstName} ${user.lastName}` : "User Profile"}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-8">
                {/* Profile Information */}
                <div>
                  <div className="mb-6">
                    <form
                      ref={profileFormRef}
                      onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...profileForm.register("firstName")}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? "bg-gray-50" : ""}
                        />
                        {isEditingProfile &&
                          profileForm.formState.errors.firstName && (
                            <p className="text-sm text-destructive mt-1">
                              {profileForm.formState.errors.firstName.message}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...profileForm.register("lastName")}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? "bg-gray-50" : ""}
                        />
                        {isEditingProfile &&
                          profileForm.formState.errors.lastName && (
                            <p className="text-sm text-destructive mt-1">
                              {profileForm.formState.errors.lastName.message}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...profileForm.register("email")}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? "bg-gray-50" : ""}
                        />
                        {isEditingProfile &&
                          profileForm.formState.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact (Optional)</Label>
                        <Input
                          id="contact"
                          {...profileForm.register("contact")}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? "bg-gray-50" : ""}
                          placeholder="Phone number or other contact"
                        />
                      </div>

                    </form>
                  </div>
                </div>

                {!isEditingProfile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(true)}
                    className="mt-4 w-full"
                  >
                    Edit Information
                  </Button>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button"
                      onClick={() => profileFormRef.current?.requestSubmit()}
                      disabled={isSavingProfile}
                      className="w-auto"
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      className="w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="whitespace-nowrap w-full"
                  >
                    {isChangingPassword ? "Cancel" : "Change Password"}
                  </Button>
                </div>

                {/* Password Change */}
                <div>
                  {isChangingPassword && (
                    <form
                      onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            {...passwordForm.register("currentPassword")}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {
                              passwordForm.formState.errors.currentPassword
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            {...passwordForm.register("newPassword")}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            {...passwordForm.register("confirmPassword")}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {
                              passwordForm.formState.errors.confirmPassword
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
