import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, AuthResponse } from '@/lib/api'
import { AxiosError } from 'axios';
import { toast } from 'sonner';


interface AdminAuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth actions
  registerAdmin: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string, contact: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string, contact?: string, profileImage?: string, gender?: 'male' | 'female' | 'other', location?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Auto-login method for checkout flow
  setAuthData: (user: AuthResponse['user'], token: string) => void;
}

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return 'An unexpected error occurred';
};

export const useAuthStore = create<AdminAuthState>()(
  persist(
    (set, ) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      registerAdmin: async (firstName, lastName, email, password, confirmPassword, contact) => {
        try {
          set({ isLoading: true });
          const response = await authApi.registerAdmin({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            contact
          });
          
          set({
            user: response.user || null,
            token: response.token || null,
            isAuthenticated: !!response.token,
            isLoading: false
          });
          
          // Set cookie for middleware compatibility
          if (response.token) {
            document.cookie = `auth-storage=${JSON.stringify({
              state: {
                token: response.token,
                isAuthenticated: true,
                user: response.user
              }
            })}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
          }
          
          toast.success('Registration successful! Please check your email to verify your account.');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login({ email, password });
          
          set({
            user: response.user || null,
            token: response.token || null,
            isAuthenticated: !!response.token,
            isLoading: false
          });
          
          // Set cookie for middleware compatibility
          if (response.token) {
            document.cookie = `auth-storage=${JSON.stringify({
              state: {
                token: response.token,
                isAuthenticated: true,
                user: response.user
              }
            })}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
          }
          
          toast.success('Login successful! Loading portal :).');
        } catch (error) {
          set({ isLoading: false });
          
          // Check if error is due to unverified email with auto-sent OTP
          if (error instanceof AxiosError && error.response?.data?.requiresVerification) {
            const errorData = error.response.data;
            toast.success(errorData.message);
            
            // Redirect to verification page with email
            window.location.href = `/admin/verify-email?email=${encodeURIComponent(errorData.email)}`;
            return;
          }
          
          toast.error(handleApiError(error));
          throw error;
        }
      },

      verifyEmail: async (otp) => {
        try {
          set({ isLoading: true });
          const response = await authApi.verifyEmail({ otp });
          
          // Auto-login user after verification
          set({
            user: response.user || null,
            token: response.token || null,
            isAuthenticated: !!response.token,
            isLoading: false
          });
          
          // Set cookie for middleware compatibility
          if (response.token) {
            document.cookie = `auth-storage=${JSON.stringify({
              state: {
                token: response.token,
                isAuthenticated: true,
                user: response.user
              }
            })}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
          }
          
          toast.success('Email verified successfully! Welcome!');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
          throw error;
        }
      },

      resendVerification: async (email) => {
        try {
          set({ isLoading: true });
          await authApi.resendVerification({ email });
          set({ isLoading: false });
          toast.success('Verification email has been resent. Please check your inbox.');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
          throw error;
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true });
          await authApi.forgotPassword({ email });
          set({ isLoading: false });
          toast.success('Password reset email has been sent. Please check your inbox.');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
          throw error;
        }
      },

      resetPassword: async (token, password, confirmPassword) => {
        try {
          set({ isLoading: true });
          await authApi.resetPassword({ token, password, confirmPassword });
          set({ isLoading: false });
          toast.success('Password has been reset successfully!');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
          throw error;
        }
      },

      updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
          await authApi.updatePassword({ currentPassword, newPassword, confirmPassword });
          toast.success('Password updated successfully!');
        } catch (error) {
          toast.error(handleApiError(error));
          throw error;
        }
      },

      updateProfile: async (firstName, lastName, contact, profileImage, gender, location) => {
        try {
          const response = await authApi.updateProfile({ firstName, lastName, contact, profileImage, gender, location });
          
          // Update user data in store
          set((state) => ({ 
            ...state,
            user: response.user || state.user
          }));
          
          toast.success('Profile updated successfully!');
        } catch (error) {
          toast.error(handleApiError(error));
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authApi.logout();
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          
          // Remove cookie for middleware compatibility
          document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          toast.success('Logged out successfully.');
        } catch (error) {
          set({ isLoading: false });
          toast.error(handleApiError(error));
        }
      },

      setAuthData: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Set cookie for middleware compatibility
        document.cookie = `auth-storage=${JSON.stringify({
          state: {
            token,
            isAuthenticated: true,
            user
          }
        })}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      // Sync with cookies for middleware compatibility
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.isAuthenticated) {
          // Set cookie for middleware
          document.cookie = `auth-storage=${JSON.stringify({
            state: {
              token: state.token,
              isAuthenticated: state.isAuthenticated,
              user: state.user
            }
          })}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
      }
    }
  )
);