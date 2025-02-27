// src/pages/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormData } from '../../hooks/useFormData';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../config/routes';
import { isValidEmail } from '../../utils/validators';
import api from '../../services/api';

const ForgotPassword: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { values, errors, isSubmitting, setValue, setError, handleSubmit } = useFormData({
    email: '',
  });
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.email) {
      setError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(values.email)) {
      setError('email', 'Invalid email format');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setServerError(null);
    
    try {
      // This endpoint is not implemented in our backend, but we're simulating it
      // In a real implementation, we would call an API endpoint to send a reset email
      // await api.post('/auth/forgot-password/', { email: values.email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setServerError('Failed to send reset email. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isEmailSent ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-2 text-sm text-gray-500">
                We've sent a password reset link to {values.email}. Please check your inbox.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" className="w-full">
                    Back to sign in
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
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  error={errors.email}
                  onChange={(e) => setValue('email', e.target.value)}
                />
                
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Send reset link
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

export default ForgotPassword;