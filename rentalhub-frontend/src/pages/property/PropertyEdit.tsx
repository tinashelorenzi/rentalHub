// src/pages/property/PropertyEdit.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyService } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { Property, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { PROPERTY_CATEGORIES, PROPERTY_STATUSES } from '../../config/constants';
import { useFormData } from '../../hooks/useFormData';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Textarea from '../../components/forms/Textarea';
import Button from '../../components/common/Button';
import FileUpload from '../../components/forms/FileUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [propertyManagers, setPropertyManagers] = useState<User[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  
  const { values, errors, setValue, setError: setFieldError, handleSubmit } = useFormData({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    category: 'RESIDENTIAL',
    status: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    monthly_rent: '',
    deposit_amount: '',
    description: '',
    amenities: '',
    property_manager_id: '',
  });
  
  const fetchProperty = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const propertyData = await PropertyService.getProperty(parseInt(id));
      setProperty(propertyData);
      
      // Populate form with property data
      setValue('name', propertyData.name);
      setValue('address', propertyData.address);
      setValue('city', propertyData.city);
      setValue('state', propertyData.state);
      setValue('zip_code', propertyData.zip_code);
      setValue('country', propertyData.country);
      setValue('category', propertyData.category);
      setValue('status', propertyData.status);
      setValue('bedrooms', propertyData.bedrooms.toString());
      setValue('bathrooms', propertyData.bathrooms.toString());
      setValue('square_feet', propertyData.square_feet.toString());
      setValue('monthly_rent', propertyData.monthly_rent.toString());
      setValue('deposit_amount', propertyData.deposit_amount.toString());
      setValue('description', propertyData.description || '');
      setValue('amenities', propertyData.amenities || '');
      setValue('property_manager_id', propertyData.property_manager_id ? propertyData.property_manager_id.toString() : '');
      
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load property managers for assignment
  const loadPropertyManagers = async () => {
    if (user?.role !== 'LANDLORD' && user?.role !== 'ADMIN') return;
    
    try {
      setIsLoadingManagers(true);
      const managers = await UserService.searchUsers({ role: 'PROPERTY_MANAGER' });
      setPropertyManagers(managers.map(manager => ({
        ...manager,
        role: manager.role as "ADMIN" | "LANDLORD" | "PROPERTY_MANAGER" | "TENANT"
      })));
    } catch (err) {
      console.error('Error loading property managers:', err);
    } finally {
      setIsLoadingManagers(false);
    }
  };
  
  useEffect(() => {
    fetchProperty();
  }, [id]);
  
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
    
    if (!values.status) {
      setFieldError('status', 'Status is required');
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
    if (!validateForm() || !property) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare property data
      const propertyData: Partial<Property> = {
        name: values.name,
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        country: values.country,
        category: values.category as "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL",
        status: values.status as "AVAILABLE" | "RENTED" | "MAINTENANCE",
        bedrooms: parseInt(values.bedrooms),
        bathrooms: parseInt(values.bathrooms),
        square_feet: parseInt(values.square_feet),
        monthly_rent: parseFloat(values.monthly_rent),
        deposit_amount: parseFloat(values.deposit_amount),
        description: values.description,
        amenities: values.amenities,
        property_manager_id: values.property_manager_id ? parseInt(values.property_manager_id) : undefined,
      };
      
      // Update property
      await PropertyService.updateProperty(property.id, propertyData);
      
      // Upload new images if any
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await PropertyService.uploadPropertyImage(
            property.id,
            image,
            i === 0 && !property.images?.some(img => img.is_primary) // Set as primary only if no primary image exists
          );
        }
      }
      
      // Navigate back to the property details
      navigate(ROUTES.PROPERTY_DETAILS(property.id));
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if user can edit this property
  const canEditProperty = property && user && (
    user.role === 'ADMIN' || 
    (user.role === 'LANDLORD' && property.owner_id === user.id) ||
    (user.role === 'PROPERTY_MANAGER' && property.property_manager_id === user.id)
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <EmptyState
        title="Error loading property"
        description={error || "Property not found"}
        action={{
          label: "Back to Properties",
          onClick: () => navigate(ROUTES.PROPERTIES),
        }}
      />
    );
  }
  
  if (!canEditProperty) {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to edit this property."
        action={{
          label: "Back to Properties",
          onClick: () => navigate(ROUTES.PROPERTIES),
        }}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Edit Property: ${property.name}`}
        subtitle="Update property information"
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
              
              <Select
                id="status"
                label="Property Status"
                options={PROPERTY_STATUSES}
                value={values.status}
                error={errors.status}
                onChange={(value) => setValue('status', value)}
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
          
          {/* Additional Property Images */}
          <Card title="Additional Property Images">
            <p className="text-sm text-gray-500 mb-4">
              Upload additional images for this property. These images will be added to the existing ones.
            </p>
            <FileUpload
              label="Upload Property Images"
              accept="image/*"
              multiple
              onChange={setImages}
              hint="Upload property images. If this is a new property, the first image will be set as the primary image."
            />
            {property.images && property.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images ({property.images.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {property.images.map((image) => (
                    <div key={image.id} className="relative w-20 h-20">
                      <img 
                        src={image.url} 
                        alt={image.caption || 'Property image'} 
                        className="w-full h-full object-cover rounded-md"
                      />
                      {image.is_primary && (
                        <div className="absolute top-0 right-0 bg-primary text-white rounded-bl-md rounded-tr-md text-xs px-1">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          {/* Property Management */}
          {(user?.role === 'LANDLORD' || user?.role === 'ADMIN') && (
            <Card title="Property Management">
              <Select
                id="property_manager_id"
                label="Assign Property Manager (Optional)"
                options={[
                  { value: '', label: 'None' },
                  ...propertyManagers.map(manager => ({
                    value: String(manager.id),
                    label: `${manager.first_name} ${manager.last_name} (${manager.email})`
                  }))
                ]}
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
              onClick={() => navigate(ROUTES.PROPERTY_DETAILS(property.id))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Update Property
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyEdit;