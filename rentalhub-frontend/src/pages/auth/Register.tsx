// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormData } from '../../hooks/useFormData';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Button from '../../components/common/Button';
import { ROUTES } from '../../config/routes';
import { USER_ROLES } from '../../config/constants';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import api from '../../services/api';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { values, errors, isSubmitting, setValue, setError, handleSubmit } = useFormData<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: '',
    phone_number: '',
  });
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.username) {
      setError('username', 'Username is required');
      isValid = false;
    }
    
    if (!values.email) {
      setError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(values.email)) {
      setError('email', 'Invalid email format');
      isValid = false;
    }
    
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
    
    if (!values.first_name) {
      setError('first_name', 'First name is required');
      isValid = false;
    }
    
    if (!values.last_name) {
      setError('last_name', 'Last name is required');
      isValid = false;
    }
    
    if (!values.role) {
      setError('role', 'Please select a role');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setServerError(null);
    
    // Extract form data without confirmPassword
    const { confirmPassword, ...formData } = values;
    
    try {
      await api.post('/users/', formData);
      navigate(ROUTES.LOGIN, { 
        state: { 
          message: 'Registration successful! Please sign in with your new account.' 
        } 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data) {
        // Handle API validation errors
        if (error.response.data.detail) {
          setServerError(error.response.data.detail);
        } else if (typeof error.response.data === 'object') {
          // Handle field-specific errors
          Object.entries(error.response.data).forEach(([key, value]) => {
            if (key in values) {
              setError(key as keyof RegisterFormData, Array.isArray(value) ? value[0] : String(value));
            }
          });
        } else {
          setServerError('Registration failed. Please try again.');
        }
      } else {
        setServerError('Registration failed. Please try again.');
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
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
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <Input
                id="first_name"
                label="First Name"
                type="text"
                value={values.first_name}
                error={errors.first_name}
                onChange={(e) => setValue('first_name', e.target.value)}
              />
              
              <Input
                id="last_name"
                label="Last Name"
                type="text"
                value={values.last_name}
                error={errors.last_name}
                onChange={(e) => setValue('last_name', e.target.value)}
              />
            </div>
            
            <Input
              id="username"
              label="Username"
              type="text"
              autoComplete="username"
              value={values.username}
              error={errors.username}
              onChange={(e) => setValue('username', e.target.value)}
            />
            
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(e) => setValue('email', e.target.value)}
            />
            
            <Input
              id="phone_number"
              label="Phone Number (optional)"
              type="tel"
              value={values.phone_number}
              error={errors.phone_number}
              onChange={(e) => setValue('phone_number', e.target.value)}
            />
            
            <Select
              id="role"
              label="Role"
              options={USER_ROLES.filter(role => role.value !== 'ADMIN')} // Filter out admin role
              value={values.role}
              error={errors.role}
              onChange={(value) => setValue('role', value)}
            />
            
            <Input
              id="password"
              label="Password"
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
                Register
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;