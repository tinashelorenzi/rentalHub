// src/pages/auth/ResetPassword.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormData } from '../../hooks/useFormData';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../config/routes';
import { isValidPassword } from '../../utils/validators';
import api from '../../services/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false);
  
  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  const { values, errors, isSubmitting, setValue, setError, handleSubmit } = useFormData({
    password: '',
    confirmPassword: '',
  });
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.password) {
      setError('password', 'Password is required');
      isValid = false;
    } else if (!isValidPassword(values.password)) {
      setError('password', 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number');
      isValid = false;
    }
    
    if (!values.confirmPassword) {
      setError('confirmPassword', 'Please confirm your password');
      isValid = false;
    } else if (values.confirmPassword !== values.password) {
      setError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setServerError(null);
    
    if (!token) {
      setServerError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    try {
      // This endpoint is not implemented in our backend, but we're simulating it
      // In a real implementation, we would call an API endpoint to reset the password
      // await api.post('/auth/reset-password/', {
      //   token,
      //   password: values.password,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsResetComplete(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setServerError('Failed to reset password. Please try again or request a new reset link.');
    }
  };
  
  // If no token is provided, show error
  if (!token && !isResetComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invalid Reset Link
          </h2>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Invalid Reset Link</h3>
              <p className="mt-2 text-sm text-gray-500">
                The password reset link is invalid or has expired.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.FORGOT_PASSWORD}>
                  <Button variant="primary" className="w-full">
                    Request a new link
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isResetComplete ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Password reset complete</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {serverError}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  id="password"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  error={errors.password}
                  hint="At least 8 characters with uppercase, lowercase, and a number"
                  onChange={(e) => setValue('password', e.target.value)}
                />
                
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(e) => setValue('confirmPassword', e.target.value)}
                />
                
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Reset password
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;