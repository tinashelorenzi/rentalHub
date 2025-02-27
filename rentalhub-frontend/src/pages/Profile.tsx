// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/user.service';
import { useFormData } from '../hooks/useFormData';
import { isValidEmail, isValidPassword, isValidPhoneNumber } from '../utils/validators';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Input from '../components/forms/Input';
import Button from '../components/common/Button';
import FileUpload from '../components/forms/FileUpload';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  
  const { values, errors, setValue, setError, handleSubmit } = useFormData({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  useEffect(() => {
    // Reset form if user data changes
    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('email', user.email);
      setValue('phone_number', user.phone_number || '');
    }
  }, [user]);
  
  const validateProfileForm = (): boolean => {
    let isValid = true;
    
    if (!values.first_name) {
      setError('first_name', 'First name is required');
      isValid = false;
    }
    
    if (!values.last_name) {
      setError('last_name', 'Last name is required');
      isValid = false;
    }
    
    if (!values.email) {
      setError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(values.email)) {
      setError('email', 'Invalid email format');
      isValid = false;
    }
    
    if (values.phone_number && !isValidPhoneNumber(values.phone_number)) {
      setError('phone_number', 'Invalid phone number format');
      isValid = false;
    }
    
    return isValid;
  };
  
  const validatePasswordForm = (): boolean => {
    let isValid = true;
    
    if (!values.current_password) {
      setError('current_password', 'Current password is required');
      isValid = false;
    }
    
    if (!values.new_password) {
      setError('new_password', 'New password is required');
      isValid = false;
    } else if (!isValidPassword(values.new_password)) {
      setError('new_password', 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number');
      isValid = false;
    }
    
    if (!values.confirm_password) {
      setError('confirm_password', 'Please confirm your new password');
      isValid = false;
    } else if (values.new_password !== values.confirm_password) {
      setError('confirm_password', 'Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      const userData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number || undefined,
      };
      
      const updatedUser = await UserService.updateProfile(userData);
      
      // Upload profile image if selected
      if (profileImage) {
        await UserService.uploadProfileImage(profileImage);
        // In a real app, we would get the new image URL here
      }
      
      updateUser(updatedUser);
      setUpdateSuccess(true);
      
      // Reset profile image state
      setProfileImage(null);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;
    
    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      // In a real application, we would call an API to update the password
      // For now, let's simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset password fields
      setValue('current_password', '');
      setValue('new_password', '');
      setValue('confirm_password', '');
      
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Error updating password:', error);
      setUpdateError('Failed to update password. Please check your current password and try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!user) {
    return null; // User should be redirected to login by the ProtectedRoute
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profile Settings" 
        subtitle="Manage your account information"
      />
      
      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Your profile has been updated successfully.
        </div>
      )}
      
      {updateError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {updateError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <Card title="Profile Information">
            <form onSubmit={handleSubmit(handleUpdateProfile)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  id="first_name"
                  label="First Name"
                  value={values.first_name}
                  error={errors.first_name}
                  onChange={(e) => setValue('first_name', e.target.value)}
                />
                
                <Input
                  id="last_name"
                  label="Last Name"
                  value={values.last_name}
                  error={errors.last_name}
                  onChange={(e) => setValue('last_name', e.target.value)}
                />
                
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  onChange={(e) => setValue('email', e.target.value)}
                />
                
                <Input
                  id="phone_number"
                  label="Phone Number (optional)"
                  value={values.phone_number}
                  error={errors.phone_number}
                  onChange={(e) => setValue('phone_number', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdating}
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>
          
          {/* Password Update */}
          <Card title="Update Password" className="mt-6">
            <form onSubmit={handleSubmit(handleUpdatePassword)}>
              <div className="space-y-6 mb-6">
                <Input
                  id="current_password"
                  label="Current Password"
                  type="password"
                  value={values.current_password}
                  error={errors.current_password}
                  onChange={(e) => setValue('current_password', e.target.value)}
                />
                
                <Input
                  id="new_password"
                  label="New Password"
                  type="password"
                  value={values.new_password}
                  error={errors.new_password}
                  onChange={(e) => setValue('new_password', e.target.value)}
                />
                
                <Input
                  id="confirm_password"
                  label="Confirm New Password"
                  type="password"
                  value={values.confirm_password}
                  error={errors.confirm_password}
                  onChange={(e) => setValue('confirm_password', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdating}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        {/* Profile Picture */}
        <div className="md:col-span-1">
          <Card title="Profile Picture">
            <div className="flex flex-col items-center space-y-4">
              <Avatar 
                src={user.profile_image} 
                name={`${user.first_name} ${user.last_name}`} 
                size="xl" 
              />
              
              <FileUpload
                accept="image/*"
                onChange={(files) => setProfileImage(files[0])}
                hint="Upload a new profile picture"
              />
              
              {profileImage && (
                <div className="text-sm text-gray-600">
                  <p>Selected file: {profileImage.name}</p>
                  <p className="mt-2">Click "Update Profile" to save your new picture.</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Account Information */}
          <Card title="Account Information" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1">{user.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">{user.role}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;