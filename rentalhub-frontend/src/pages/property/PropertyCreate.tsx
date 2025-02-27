// src/pages/property/PropertyCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyService } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { PROPERTY_CATEGORIES } from '../../config/constants';
import { useFormData } from '../../hooks/useFormData';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Textarea from '../../components/forms/Textarea';
import Button from '../../components/common/Button';
import FileUpload from '../../components/forms/FileUpload';

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  category: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  monthly_rent: string;
  deposit_amount: string;
  description: string;
  amenities: string;
  property_manager_id: string;
}

const PropertyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [propertyManagers, setPropertyManagers] = useState<User[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  
  const { values, errors, setValue, setError: setFieldError, handleSubmit } = useFormData<PropertyFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    category: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    monthly_rent: '',
    deposit_amount: '',
    description: '',
    amenities: '',
    property_manager_id: '',
  });
  
  // Load property managers for assignment
  const loadPropertyManagers = async () => {
    if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') return;
    
    try {
      setIsLoadingManagers(true);
      const managers = await UserService.searchUsers({ role: 'PROPERTY_MANAGER' });
      setPropertyManagers(managers.map(manager => {
  if (manager.role === 'ADMIN' || manager.role === 'LANDLORD' || manager.role === 'PROPERTY_MANAGER' || manager.role === 'TENANT') {
    return {
      id: manager.id,
      username: manager.username,
      email: manager.email,
      first_name: manager.first_name,
      last_name: manager.last_name,
      role: manager.role,
      phone_number: manager.phone_number,
      profile_image: manager.profile_image,
    }
  } else {
    throw new Error(`Invalid role: ${manager.role}`)
  }
}));
    } catch (err) {
      console.error('Error loading property managers:', err);
    } finally {
      setIsLoadingManagers(false);
    }
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.name) {
      setFieldError('name', 'Property name is required');
      isValid = false;
    }
    
    if (!values.address) {
      setFieldError('address', 'Address is required');
      isValid = false;
    }
    
    if (!values.city) {
      setFieldError('city', 'City is required');
      isValid = false;
    }
    
    if (!values.state) {
      setFieldError('state', 'State is required');
      isValid = false;
    }
    
    if (!values.zip_code) {
      setFieldError('zip_code', 'ZIP code is required');
      isValid = false;
    }
    
    if (!values.category) {
      setFieldError('category', 'Category is required');
      isValid = false;
    }
    
    if (!values.bedrooms) {
      setFieldError('bedrooms', 'Number of bedrooms is required');
      isValid = false;
    } else if (parseInt(values.bedrooms) < 0) {
      setFieldError('bedrooms', 'Bedrooms cannot be negative');
      isValid = false;
    }
    
    if (!values.bathrooms) {
      setFieldError('bathrooms', 'Number of bathrooms is required');
      isValid = false;
    } else if (parseInt(values.bathrooms) < 0) {
      setFieldError('bathrooms', 'Bathrooms cannot be negative');
      isValid = false;
    }
    
    if (!values.square_feet) {
      setFieldError('square_feet', 'Square footage is required');
      isValid = false;
    } else if (parseInt(values.square_feet) < 0) {
      setFieldError('square_feet', 'Square footage cannot be negative');
      isValid = false;
    }
    
    if (!values.monthly_rent) {
      setFieldError('monthly_rent', 'Monthly rent is required');
      isValid = false;
    } else if (parseFloat(values.monthly_rent) < 0) {
      setFieldError('monthly_rent', 'Rent cannot be negative');
      isValid = false;
    }
    
    if (!values.deposit_amount) {
      setFieldError('deposit_amount', 'Deposit amount is required');
      isValid = false;
    } else if (parseFloat(values.deposit_amount) < 0) {
      setFieldError('deposit_amount', 'Deposit cannot be negative');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare property data
      const propertyData = {
        name: values.name,
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        country: values.country,
        category: values.category as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL',
        bedrooms: parseInt(values.bedrooms),
        bathrooms: parseInt(values.bathrooms),
        square_feet: parseInt(values.square_feet),
        monthly_rent: parseFloat(values.monthly_rent),
        deposit_amount: parseFloat(values.deposit_amount),
        description: values.description,
        amenities: values.amenities,
        property_manager_id: values.property_manager_id ? parseInt(values.property_manager_id) : undefined,
        status: 'AVAILABLE' as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE', // or any default status
        owner_id: user?.id ?? 0, // assuming the user is the owner, default to 0 if undefined
      };
      
      // Create property
      const createdProperty = await PropertyService.createProperty(propertyData);
      
      // Upload images if any
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await PropertyService.uploadPropertyImage(
            createdProperty.id,
            image,
            i === 0 // Set first image as primary
          );
        }
      }
      
      // Navigate to the newly created property
      navigate(ROUTES.PROPERTY_DETAILS(createdProperty.id));
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Add New Property" 
        subtitle="Create a new property listing"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                id="name"
                label="Property Name"
                value={values.name}
                error={errors.name}
                onChange={(e) => setValue('name', e.target.value)}
              />
              
              <Select
                id="category"
                label="Property Category"
                options={PROPERTY_CATEGORIES}
                value={values.category}
                error={errors.category}
                onChange={(value) => setValue('category', value)}
              />
              
              <Input
                id="address"
                label="Street Address"
                value={values.address}
                error={errors.address}
                onChange={(e) => setValue('address', e.target.value)}
              />
              
              <Input
                id="city"
                label="City"
                value={values.city}
                error={errors.city}
                onChange={(e) => setValue('city', e.target.value)}
              />
              
              <Input
                id="state"
                label="State/Province"
                value={values.state}
                error={errors.state}
                onChange={(e) => setValue('state', e.target.value)}
              />
              
              <Input
                id="zip_code"
                label="ZIP/Postal Code"
                value={values.zip_code}
                error={errors.zip_code}
                onChange={(e) => setValue('zip_code', e.target.value)}
              />
              
              <Input
                id="country"
                label="Country"
                value={values.country}
                error={errors.country}
                onChange={(e) => setValue('country', e.target.value)}
              />
            </div>
          </Card>
          
          {/* Property Details */}
          <Card title="Property Details">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Input
                id="bedrooms"
                label="Bedrooms"
                type="number"
                min="0"
                value={values.bedrooms}
                error={errors.bedrooms}
                onChange={(e) => setValue('bedrooms', e.target.value)}
              />
              
              <Input
                id="bathrooms"
                label="Bathrooms"
                type="number"
                min="0"
                value={values.bathrooms}
                error={errors.bathrooms}
                onChange={(e) => setValue('bathrooms', e.target.value)}
              />
              
              <Input
                id="square_feet"
                label="Square Feet"
                type="number"
                min="0"
                value={values.square_feet}
                error={errors.square_feet}
                onChange={(e) => setValue('square_feet', e.target.value)}
              />
              
              <Input
                id="monthly_rent"
                label="Monthly Rent ($)"
                type="number"
                min="0"
                step="0.01"
                value={values.monthly_rent}
                error={errors.monthly_rent}
                onChange={(e) => setValue('monthly_rent', e.target.value)}
              />
              
              <Input
                id="deposit_amount"
                label="Deposit Amount ($)"
                type="number"
                min="0"
                step="0.01"
                value={values.deposit_amount}
                error={errors.deposit_amount}
                onChange={(e) => setValue('deposit_amount', e.target.value)}
              />
            </div>
            
            <div className="mt-6 space-y-6">
              <Textarea
                id="description"
                label="Property Description"
                value={values.description}
                error={errors.description}
                onChange={(e) => setValue('description', e.target.value)}
              />
              
              <Textarea
                id="amenities"
                label="Amenities"
                value={values.amenities}
                error={errors.amenities}
                hint="List property amenities, separated by commas"
                onChange={(e) => setValue('amenities', e.target.value)}
              />
            </div>
          </Card>
          
          {/* Property Images */}
          <Card title="Property Images">
            <FileUpload
              label="Upload Property Images"
              accept="image/*"
              multiple
              onChange={setImages}
              hint="Upload property images. The first image will be set as the primary image."
            />
          </Card>
          
          {/* Property Management */}
          {(user?.role === 'LANDLORD' || user?.role === 'ADMIN') && (
            <Card title="Property Management">
              <Select
                id="property_manager_id"
                label="Assign Property Manager (Optional)"
                options={propertyManagers.map(manager => ({
                  value: String(manager.id),
                  label: `${manager.first_name} ${manager.last_name} (${manager.email})`
                }))}
                value={values.property_manager_id}
                error={errors.property_manager_id}
                onChange={(value) => setValue('property_manager_id', value)}
                onFocus={loadPropertyManagers}
              />
              {isLoadingManagers && <p className="text-sm text-gray-500 mt-2">Loading property managers...</p>}
            </Card>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.PROPERTIES)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Create Property
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyCreate;