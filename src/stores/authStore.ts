import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, AuthResponse } from '@/lib/api'
import { AxiosError } from 'axios';


interface AdminAuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  registerAdmin: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string, contact: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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
      error: null,

      registerAdmin: async (firstName, lastName, email, password, confirmPassword, contact) => {
        try {
          set({ isLoading: true, error: null });
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
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login({ email, password });
          
          set({
            user: response.user || null,
            token: response.token || null,
            isAuthenticated: !!response.token,
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      verifyEmail: async (token) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.verifyEmail({ token });
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      resendVerification: async (email) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.resendVerification({ email });
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.forgotPassword({ email });
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      resetPassword: async (token, password, confirmPassword) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.resetPassword({ token, password, confirmPassword });
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
          throw error;
        }
      },

      updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.updatePassword({ currentPassword, newPassword, confirmPassword });
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
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
        } catch (error) {
          set({ 
            isLoading: false, 
            error: handleApiError(error)
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);