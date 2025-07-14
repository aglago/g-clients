import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi, AdminSignupRequest, LoginRequest } from '@/lib/api';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { 
    registerAdmin: storeRegisterAdmin, 
    login: storeLogin,
    verifyEmail: storeVerifyEmail,
    resendVerification: storeResendVerification,
    forgotPassword: storeForgotPassword,
    resetPassword: storeResetPassword,
    logout: storeLogout
  } = useAuthStore();

  // Register admin mutation
  const registerAdminMutation = useMutation({
    mutationFn: (data: AdminSignupRequest) => authApi.registerAdmin(data),
    onSuccess: (data) => {
      // Update auth store
      if (data.user && data.token) {
        storeRegisterAdmin(
          data.user.firstName,
          data.user.lastName,
          data.user.email,
          '', // We don't store passwords
          '', // We don't store passwords
          data.user.contact || ''
        );
      }
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Update auth store
      if (data.token) {
        storeLogin(data.user?.email || '', ''); // We don't store passwords
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => storeVerifyEmail(token)
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => storeResendVerification(email)
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => storeForgotPassword(email)
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }) => 
      storeResetPassword(token, password, confirmPassword)
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => storeLogout(),
    onSuccess: () => {
      // Clear relevant queries from cache
      queryClient.clear();
    }
  });

  return {
    registerAdmin: registerAdminMutation.mutate,
    isRegisterLoading: registerAdminMutation.isPending,
    registerError: registerAdminMutation.error,
    
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    
    verifyEmail: verifyEmailMutation.mutate,
    isVerifyEmailLoading: verifyEmailMutation.isPending,
    verifyEmailError: verifyEmailMutation.error,
    
    resendVerification: resendVerificationMutation.mutate,
    isResendVerificationLoading: resendVerificationMutation.isPending,
    resendVerificationError: resendVerificationMutation.error,
    
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error,
    
    resetPassword: resetPasswordMutation.mutate,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,
    
    logout: logoutMutation.mutate,
    isLogoutLoading: logoutMutation.isPending,
    logoutError: logoutMutation.error,
  };
};