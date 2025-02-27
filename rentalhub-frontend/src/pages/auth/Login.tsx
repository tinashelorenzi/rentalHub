// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormData } from '../../hooks/useFormData';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../config/routes';
import { isValidEmail } from '../../utils/validators';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;
  
  const { values, errors, isSubmitting, setValue, setError, handleSubmit } = useFormData({
    username: '',
    password: '',
  });
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.username) {
      setError('username', 'Username is required');
      isValid = false;
    } else if (isValidEmail(values.username) && !isValidEmail(values.username)) {
      setError('username', 'Invalid email format');
      isValid = false;
    }
    
    if (!values.password) {
      setError('password', 'Password is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setServerError(null);
    
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setServerError(
        error instanceof Error 
          ? error.message 
          : 'Invalid username or password. Please try again.'
      );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to RentalHub
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {serverError}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="username"
              label="Username or Email"
              type="text"
              autoComplete="username"
              value={values.username}
              error={errors.username}
              onChange={(e) => setValue('username', e.target.value)}
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              error={errors.password}
              onChange={(e) => setValue('password', e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                Sign in
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;