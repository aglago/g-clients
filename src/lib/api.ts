import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Base API URL - Now using local API
const API_BASE_URL = '/api';


// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand store instead of localStorage directly
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsedAuth = JSON.parse(authStorage);
        const token = parsedAuth.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// AUTH TYPES AND ENDPOINTS
// =========================

export interface AdminSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contact: string;
}

export interface LearnerSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contact: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  otp: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  contact?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    contact?: string;
  };
}

const authApi = {
  // POST /auth/register-admin - Register Admin
  registerAdmin: async (data: AdminSignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register-admin', data);
    return response.data;
  },

  // POST /auth/register-learner - Register Learner
  registerLearner: async (data: LearnerSignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register-learner', data);
    return response.data;
  },

  // POST /auth/login - Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    // Token will be stored by the auth store, not here
    return response.data;
  },

  // POST /auth/verify-email - Verify Email
  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-email', data);
    console.log('Email verification response:', response.data);
    console.log('Email verification OTP:', data.otp);
    return response.data;
  },

  // POST /auth/resend-verification - Resend Verification Token
  resendVerification: async (data: ResendVerificationRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/resend-verification', data);
    
    return response.data;
  },

  // POST /auth/forgot-password - Forgot Password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // POST /auth/reset-password - Reset Password
  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // POST /auth/update-password - Update Password
  updatePassword: async (data: UpdatePasswordRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/update-password', data);
    return response.data;
  },

  // POST /auth/logout - Logout
  logout: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/logout');
    // Token will be removed by the auth store, not here
    return response.data;
  },

  // GET /auth/check - Check Auth
  checkAuth: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/check');
    return response.data;
  },

  // PUT /auth/update-user - Update User/Complete Profile
  updateProfile: async (data: UpdateProfileRequest): Promise<AuthResponse> => {
    const response = await apiClient.put('/auth/update-user', data);
    return response.data;
  },
};

// =========================
// COURSES TYPES AND ENDPOINTS
// =========================

export interface Course {
  id: string;
  title: string;
  track: string;
  picture: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  price: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  instructor?: string;
  duration?: number;
  price?: number;
}

const coursesApi = {
  // GET /courses - Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses');
    return response.data;
  },

  // GET /courses/:id - Get course by ID
  getCourseById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  // POST /courses - Create a new course
  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  // PUT /courses/:id - Update a course
  updateCourse: async (id: string, data: UpdateCourseRequest): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  // DELETE /courses/:id - Delete a course
  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  }
};

// =========================
// LEARNERS TYPES AND ENDPOINTS
// =========================

export interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contact: string;
}

export interface UpdateLearnerRequest {
  firstName?: string;
  lastName?: string;
  contact?: string;
}

const learnersApi = {
  // GET /learners - Get all learners
  getAllLearners: async (): Promise<Learner[]> => {
    const response = await apiClient.get('/learners');
    return response.data;
  },

  // GET /learners/:id - Get learner by ID
  getLearnerById: async (id: string): Promise<Learner> => {
    const response = await apiClient.get(`/learners/${id}`);
    return response.data;
  },

  // POST /learners - Create a new learner (this might be handled by auth/signup/learner)
  createLearner: async (data: CreateLearnerRequest): Promise<Learner> => {
    const response = await apiClient.post('/learners', data);
    return response.data;
  },

  // PUT /learners/:id - Update a learner
  updateLearner: async (id: string, data: UpdateLearnerRequest): Promise<Learner> => {
    const response = await apiClient.put(`/learners/${id}`, data);
    return response.data;
  },

  // DELETE /learners/:id - Delete a learner
  deleteLearner: async (id: string): Promise<void> => {
    await apiClient.delete(`/learners/${id}`);
  }
};

// =========================
// TRACKS TYPES AND ENDPOINTS
// =========================

export interface Track {
  id: string;
  name: string;
  price: number;
  duration: number;
  instructor: string;
  picture: string;
  description: string;
  courses?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackRequest {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  price: number;
}

export interface UpdateTrackRequest {
  title?: string;
  description?: string;
  instructor?: string;
  duration?: number;
  price?: number;
}


const tracksApi = {
  // GET /tracks - Get all tracks
  getAllTracks: async (): Promise<Track[]> => {
    const response = await apiClient.get('/tracks');
    return response.data;
  },

  // GET /tracks/:id - Get track by ID
  getTrackById: async (id: string): Promise<Track> => {
    const response = await apiClient.get(`/tracks/${id}`);
    return response.data;
  },

  // POST /tracks - Create a new track
  createTrack: async (data: CreateTrackRequest): Promise<Track> => {
    const response = await apiClient.post('/tracks', data);
    return response.data;
  },

  // PUT /tracks/:id - Update a track
  updateTrack: async (id: string, data: UpdateTrackRequest): Promise<Track> => {
    const response = await apiClient.put(`/tracks/${id}`, data);
    return response.data;
  },

  // DELETE /tracks/:id - Delete a track
  deleteTrack: async (id: string): Promise<void> => {
    await apiClient.delete(`/tracks/${id}`);
  }
};

// =========================
// INVOICES TYPES AND ENDPOINTS
// =========================

export interface Invoice {
  id: string;
  learnerId: string;
  courseId?: string;
  trackId?: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  learnerId: string;
  courseId?: string;
  trackId?: string;
  amount: number;
}

export interface UpdateInvoiceRequest {
  status?: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
}

const invoicesApi = {
  // GET /invoices - Get all invoices
  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/invoices');
    return response.data;
  },

  // GET /invoices/:id - Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  // POST /invoices - Create a new invoice
  createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  // PUT /invoices/:id - Update an invoice
  updateInvoice: async (id: string, data: UpdateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response.data;
  },

  // DELETE /invoices/:id - Delete an invoice
  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  }
};

// =========================
// TRACK ENROLLMENTS TYPES AND ENDPOINTS
// =========================

export interface TrackEnrollment {
  id: string;
  trackId: string;
  learnerId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackEnrollmentRequest {
  trackId: string;
  learnerId: string;
}

export interface UpdateTrackEnrollmentRequest {
  status?: 'active' | 'completed' | 'cancelled';
  progress?: number;
}

const trackEnrollmentsApi = {
  // GET /track-enrollments - Get all track enrollments
  getAllTrackEnrollments: async (): Promise<TrackEnrollment[]> => {
    const response = await apiClient.get('/track-enrollments');
    return response.data;
  },

  // GET /track-enrollments/:id - Get track enrollment by ID
  getTrackEnrollmentById: async (id: string): Promise<TrackEnrollment> => {
    const response = await apiClient.get(`/track-enrollments/${id}`);
    return response.data;
  },

  // POST /track-enrollments - Create a new track enrollment
  createTrackEnrollment: async (data: CreateTrackEnrollmentRequest): Promise<TrackEnrollment> => {
    const response = await apiClient.post('/track-enrollments', data);
    return response.data;
  },

  // PUT /track-enrollments/:id - Update a track enrollment
  updateTrackEnrollment: async (id: string, data: UpdateTrackEnrollmentRequest): Promise<TrackEnrollment> => {
    const response = await apiClient.put(`/track-enrollments/${id}`, data);
    return response.data;
  },

  // DELETE /track-enrollments/:id - Delete a track enrollment
  deleteTrackEnrollment: async (id: string): Promise<void> => {
    await apiClient.delete(`/track-enrollments/${id}`);
  }
};

// =========================
// COURSE REGISTRATION TYPES AND ENDPOINTS
// =========================

export interface CourseRegistration {
  id: string;
  courseId: string;
  learnerId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRegistrationRequest {
  courseId: string;
  learnerId: string;
}

export interface UpdateCourseRegistrationRequest {
  status?: 'active' | 'completed' | 'cancelled';
  progress?: number;
}

const courseRegistrationsApi = {
  // GET /course-registrations - Get all course registrations
  getAllCourseRegistrations: async (): Promise<CourseRegistration[]> => {
    const response = await apiClient.get('/course-registrations');
    return response.data;
  },

  // GET /course-registrations/:id - Get course registration by ID
  getCourseRegistrationById: async (id: string): Promise<CourseRegistration> => {
    const response = await apiClient.get(`/course-registrations/${id}`);
    return response.data;
  },

  // POST /course-registrations - Create a new course registration
  createCourseRegistration: async (data: CreateCourseRegistrationRequest): Promise<CourseRegistration> => {
    const response = await apiClient.post('/course-registrations', data);
    return response.data;
  },

  // PUT /course-registrations/:id - Update a course registration
  updateCourseRegistration: async (id: string, data: UpdateCourseRegistrationRequest): Promise<CourseRegistration> => {
    const response = await apiClient.put(`/course-registrations/${id}`, data);
    return response.data;
  },

  // DELETE /course-registrations/:id - Delete a course registration
  deleteCourseRegistration: async (id: string): Promise<void> => {
    await apiClient.delete(`/course-registrations/${id}`);
  }
};

// Create a QueryClient to be used with TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// TanStack Query keys for caching
export const queryKeys = {
  auth: {
    user: 'auth-user',
    profile: 'auth-profile',
  },
  courses: {
    all: 'courses',
    detail: (id: string) => ['courses', id],
  },
  learners: {
    all: 'learners',
    detail: (id: string) => ['learners', id],
  },
  tracks: {
    all: 'tracks',
    detail: (id: string) => ['tracks', id],
  },
  invoices: {
    all: 'invoices',
    detail: (id: string) => ['invoices', id],
  },
  trackEnrollments: {
    all: 'track-enrollments',
    detail: (id: string) => ['track-enrollments', id],
  },
  courseRegistrations: {
    all: 'course-registrations',
    detail: (id: string) => ['course-registrations', id],
  },
};

// Export all API modules
export {
  authApi,
  coursesApi,
  learnersApi,
  tracksApi,
  invoicesApi,
  trackEnrollmentsApi,
  courseRegistrationsApi,
};
