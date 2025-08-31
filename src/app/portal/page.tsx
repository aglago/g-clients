'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { userApi, coursesApi } from '@/lib/api';
import LearnerHeader from '@/components/learner/learner-header';
import LearnerFooter from '@/components/learner/learner-footer';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Star,
  BookOpen,
  User,
  Lock,
  LogOut,
  Camera,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ActiveTab = 'dashboard' | 'settings' | 'invoices';

interface TrackData {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  courses?: Array<unknown>;
}

interface EnrollmentData {
  id: string;
  trackId: TrackData;
}

interface CourseData {
  id: string;
  title: string;
  track: string;
  description?: string;
  picture?: string;
}

interface InvoiceData {
  id: string;
  trackName?: string;
  trackId?: string;
  courseId?: string;
  createdAt: string;
  amount: number;
  status: string;
}

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerHeader />
      
      {/* Hero Section with Navigation */}
      <section className="bg-primary pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Learner Portal
            </h1>
            <p className="text-xl text-white/90">
              Welcome back, {user?.firstName}!
            </p>
          </div> */}

          {/* Tab Navigation */}
          <div className="flex w-full md:h-[76px] bg-white justify-start">
            <div className="flex bg-white/10 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 text-[16px] font-bold transition-all",
                      activeTab === tab.id
                        ? "bg-[#014273] text-background shadow-sm"
                        : "text-black hover:text-background hover:bg-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'invoices' && <InvoicesTab />}
        </div>
      </section>

      <LearnerFooter />
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState<{[trackId: string]: number}>({});
  const [feedback, setFeedback] = useState<{[trackId: string]: string}>({});

  const { data: enrolledTracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: userApi.getUserEnrollments,
    enabled: !!user,
  });

  const { data: allCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAllCourses,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Group courses by track
  const getCoursesForTrack = (trackId: string) => {
    return allCourses.filter((course: CourseData) => course.track === trackId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Enrolled Tracks</h2>
        
        {tracksLoading || coursesLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Card key={j} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : enrolledTracks.length > 0 ? (
          <div className="space-y-12">
            {enrolledTracks.map((enrollment: EnrollmentData) => {
              const track = enrollment.trackId;
              const trackId = track._id?.toString() || track.id?.toString() || '';
              const trackCourses = trackId ? getCoursesForTrack(trackId) : [];
              
              return (
                <div key={enrollment.id} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {track.name} Track
                  </h3>
                  
                  {trackCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trackCourses.map((course: CourseData) => (
                        <Card key={course.id} className="shadow-lg hover:shadow-lg transition-shadow overflow-hidden py-0">
                          <div className="relative h-48 w-full">
                            <Image
                              src={course.picture || '/images/course-placeholder.jpg'}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                {course.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex justify-between items-center pt-2">
                                <Badge variant="default" className="bg-primary text-white">
                                  Registered
                                </Badge>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/tracks/${track.slug}`}>
                                    Start Learning
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No courses available for this track</p>
                    </div>
                  )}
                  
                  {/* Rating Section for this Track */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Rate {track.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>How would you rate your experience with this track?</Label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatings(prev => ({...prev, [trackId]: star}))}
                              className={cn(
                                "p-1 transition-colors",
                                star <= (ratings[trackId] || 0) ? "text-[#d89612]" : "text-gray-300"
                              )}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`feedback-${trackId}`}>Tell us about your experience with this track (optional)</Label>
                        <Textarea
                          id={`feedback-${trackId}`}
                          placeholder={`Share your thoughts about ${track.name}...`}
                          value={feedback[trackId] || ''}
                          onChange={(e) => setFeedback(prev => ({...prev, [trackId]: e.target.value}))}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button disabled={(ratings[trackId] || 0) === 0} size="sm">
                        Submit Rating for {track.name}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12 shadow-none border-none">
            <CardContent>
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Tracks</h3>
              <p className="text-gray-600 mb-6">
                Start your learning journey by enrolling in a track
              </p>
              <Button asChild>
                <Link href="/tracks">Browse Tracks</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    contact: user?.contact || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getInitials = () => {
    const firstInitial = user?.firstName?.charAt(0) || '';
    const lastInitial = user?.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploadingImage(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProfileImage(data.url);
      
      // Update the profile with the new image
      await updateProfile(
        user?.firstName || '',
        user?.lastName || '',
        user?.contact || '',
        data.url
      );
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(
        profileData.firstName,
        profileData.lastName,
        profileData.contact
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Image Section */}
      <div className="space-y-6">
          <div className="text-center">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-56 h-56 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
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
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
      </div>

      {/* Profile & Password Section */}
      <div className="space-y-6 col-span-2">
        {/* Profile Section */}
        <Card className='bg-gray-background'>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex gap-2 pt-4">
                <Button onClick={handleProfileUpdate}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className='bg-gray-background'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>

            <Button>Update Password</Button>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sign out of your account securely
            </p>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
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
      <h2 className="text-2xl font-bold text-gray-900">Past Invoices</h2>
      
      <Card className='border-none shadow-xl'>
        <CardContent>
          <div className="rounded-lg">
            <Table>
              <TableHeader className='font-semibold text-[16px] font-figtree py-3.5 border-b-1'>
                <TableRow className="border-none">
                  <TableHead className="px-6 h-14 font-semibold">NUMBER</TableHead>
                  <TableHead className="px-6 h-14 font-semibold">TRACK</TableHead>
                  <TableHead className="px-6 h-14 font-semibold">DATE</TableHead>
                  <TableHead className="px-6 h-14 font-semibold">AMOUNT</TableHead>
                  <TableHead className="px-6 h-14 font-semibold">STATUS</TableHead>
                  <TableHead className="px-6 h-14 font-semibold"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index} className="!h-[76px]">
                      <TableCell className="px-6">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : userInvoices.length > 0 ? (
                  userInvoices.map((invoice: InvoiceData, index: number) => (
                    <TableRow
                      key={invoice.id}
                      className={`h-[76px] border-none`}
                    >
                      <TableCell className="px-6 font-medium">
                        #{(index + 1).toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="px-6">
                        {invoice.trackName || 'Course Enrollment'}
                      </TableCell>
                      <TableCell className="px-6">
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="px-6 font-medium">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-6">
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
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                        <p className="text-gray-600">
                          Your payment history will appear here once you make your first enrollment
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}