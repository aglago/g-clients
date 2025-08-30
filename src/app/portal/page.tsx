'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/api';
import LearnerGuard from '@/components/auth/learner-guard';
import LearnerHeader from '@/components/learner/learner-header';
import LearnerFooter from '@/components/learner/learner-footer';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Star,
  Camera,
  LogOut 
} from 'lucide-react';

type ActiveTab = 'dashboard' | 'settings' | 'invoices';

interface EnrollmentWithTrack {
  _id: string;
  trackId: {
    _id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    courses: Array<{
      _id: string;
      title: string;
      description: string;
      duration: number;
    }>;
  };
  status: string;
  enrolledAt: string;
}

interface UserInvoice {
  _id: string;
  invoiceNumber: string;
  trackId: {
    title: string;
  };
  amount: number;
  status: string;
  createdAt: string;
}

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ] as const;

  return (
    <LearnerGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <LearnerHeader />
        
        {/* Hero Section with Navigation */}
        <section className="bg-primary pt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Welcome to Your Portal
                </h1>
                <p className="text-xl text-white/90">
                  Manage your learning journey and track your progress
                </p>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <div className="flex space-x-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                            activeTab === tab.id
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'invoices' && <InvoicesTab />}
        </main>

        <LearnerFooter />
      </div>
    </LearnerGuard>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const { data: enrolledTracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: userApi.getUserEnrollments,
    enabled: !!user,
  });

  const handleRatingChange = (trackId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [trackId]: rating }));
  };

  const handleFeedbackChange = (trackId: string, value: string) => {
    setFeedback(prev => ({ ...prev, [trackId]: value }));
  };

  const submitRating = async (trackId: string) => {
    // TODO: Implement rating submission API
    console.log('Submitting rating:', { trackId, rating: ratings[trackId], feedback: feedback[trackId] });
  };

  if (tracksLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Learning Dashboard</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Learning Dashboard</h2>
      
      {enrolledTracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
            <p className="text-gray-600">Start your learning journey by enrolling in a track!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {enrolledTracks.map((enrollment: EnrollmentWithTrack) => (
            <Card key={enrollment._id} className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={enrollment.trackId.image || '/images/placeholder-track.jpg'}
                  alt={enrollment.trackId.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{enrollment.trackId.title}</h3>
                <p className="text-gray-600 mb-4">{enrollment.trackId.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Courses in this track:</h4>
                    <ul className="space-y-1">
                      {enrollment.trackId.courses?.map((course) => (
                        <li key={course._id} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {course.title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rating Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Rate this track:</h4>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(enrollment.trackId._id, star)}
                          className={`h-6 w-6 ${
                            star <= (ratings[enrollment.trackId._id] || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-full w-full fill-current" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your feedback..."
                      value={feedback[enrollment.trackId._id] || ''}
                      onChange={(e) => handleFeedbackChange(enrollment.trackId._id, e.target.value)}
                      className="w-full p-2 border rounded-md text-sm resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={() => submitRating(enrollment.trackId._id)}
                      className="mt-2"
                      size="sm"
                      disabled={!ratings[enrollment.trackId._id]}
                    >
                      Submit Rating
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    contact: user?.contact || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // TODO: Update user profile with new image
        console.log('Image uploaded:', data.url);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(
        profileData.firstName,
        profileData.lastName,
        profileData.contact,
        user?.profileImage
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              {user?.profileImage ? (
                <div className="relative">
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold">
                  {getInitials()}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              variant="outline"
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isUploadingImage ? 'Uploading...' : 'Change Photo'}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={profileData.contact}
                onChange={(e) => setProfileData(prev => ({ ...prev, contact: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <Button onClick={handleProfileUpdate} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Sign out of your account</h3>
              <p className="text-sm text-gray-600">You will be redirected to the home page</p>
            </div>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Invoices Tab Component
function InvoicesTab() {
  const { user } = useAuthStore();

  const { data: userInvoices = [], isLoading } = useQuery({
    queryKey: ['user-invoices', user?.email],
    queryFn: userApi.getUserInvoices,
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : userInvoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No invoices found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userInvoices.map((invoice: UserInvoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {invoice.trackId.title}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            invoice.status === 'paid' 
                              ? 'default' 
                              : invoice.status === 'unpaid' 
                              ? 'secondary' 
                              : 'destructive'
                          }
                          className="capitalize"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}