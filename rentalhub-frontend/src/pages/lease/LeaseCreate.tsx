// src/pages/lease/LeaseCreate.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeaseService } from '../../services/lease.service';
import { PropertyService } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { Property, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { useFormData } from '../../hooks/useFormData';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import DatePicker from '../../components/forms/DatePicker';
import FileUpload from '../../components/forms/FileUpload';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const LeaseCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null);
  
  // Tenant and property options
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  
  // Get propertyId and tenantId from query params if any
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('property_id') || '';
  const initialTenantId = queryParams.get('tenant_id') || '';
  
  const { values, errors, setValue, setError: setFieldError, handleSubmit } = useFormData({
    property_id: initialPropertyId,
    tenant_id: initialTenantId,
    start_date: '',
    end_date: '',
    rent_amount: '',
    deposit_amount: '',
    is_active: 'true',
  });
  
  // Load available properties
  const loadProperties = async () => {
    try {
      setIsLoadingProperties(true);
      
      // Only load available properties (for new leases)
      const propertiesData = await PropertyService.getProperties({ status: 'AVAILABLE' });
      
      // If a property ID was provided in the URL, also fetch that property
      // regardless of status (useful for properties that are already rented)
      if (initialPropertyId && !propertiesData.some(p => p.id.toString() === initialPropertyId)) {
        try {
          const specificProperty = await PropertyService.getProperty(parseInt(initialPropertyId));
          propertiesData.push(specificProperty);
        } catch (err) {
          console.error('Error fetching specific property:', err);
        }
      }
      
      setProperties(propertiesData);
      
      // If a property is selected, set deposit amount to match the property's deposit
      if (initialPropertyId) {
        const property = propertiesData.find(p => p.id.toString() === initialPropertyId);
        if (property) {
          setValue('rent_amount', property.monthly_rent.toString());
          setValue('deposit_amount', property.deposit_amount.toString());
        }
      }
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setIsLoadingProperties(false);
    }
  };
  
  // Load tenants
  const loadTenants = async () => {
    try {
      setIsLoadingTenants(true);
      const tenantsData = await UserService.searchUsers({ role: 'TENANT' });
      setTenants(tenantsData);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoadingTenants(false);
    }
  };
  
  useEffect(() => {
    loadProperties();
    loadTenants();
  }, [initialPropertyId, initialTenantId]);
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!values.property_id) {
      setFieldError('property_id', 'Property is required');
      isValid = false;
    }
    
    if (!values.tenant_id) {
      setFieldError('tenant_id', 'Tenant is required');
      isValid = false;
    }
    
    if (!values.start_date) {
      setFieldError('start_date', 'Start date is required');
      isValid = false;
    }
    
    if (!values.end_date) {
      setFieldError('end_date', 'End date is required');
      isValid = false;
    } else if (values.start_date && new Date(values.end_date) <= new Date(values.start_date)) {
      setFieldError('end_date', 'End date must be after start date');
      isValid = false;
    }
    
    if (!values.rent_amount) {
      setFieldError('rent_amount', 'Rent amount is required');
      isValid = false;
    } else if (parseFloat(values.rent_amount) <= 0) {
      setFieldError('rent_amount', 'Rent amount must be greater than zero');
      isValid = false;
    }
    
    if (!values.deposit_amount) {
      setFieldError('deposit_amount', 'Deposit amount is required');
      isValid = false;
    } else if (parseFloat(values.deposit_amount) < 0) {
      setFieldError('deposit_amount', 'Deposit amount cannot be negative');
      isValid = false;
    }
    
    return isValid;
  };
  
  const onSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare lease data
      const leaseData = {
        property_id: parseInt(values.property_id),
        tenant_id: parseInt(values.tenant_id),
        start_date: values.start_date,
        end_date: values.end_date,
        rent_amount: parseFloat(values.rent_amount),
        deposit_amount: parseFloat(values.deposit_amount),
        is_active: values.is_active === 'true',
      };
      
      // Create lease
      const createdLease = await LeaseService.createLease(leaseData);
      
      // Upload lease document if provided
      if (leaseDocument && createdLease.id) {
        await LeaseService.uploadLeaseDocument(createdLease.id, leaseDocument);
      }
      
      // Navigate to the newly created lease
      navigate(ROUTES.LEASE_DETAILS(createdLease.id));
    } catch (err) {
      console.error('Error creating lease:', err);
      setError('Failed to create lease. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check permissions to create a lease
  const canCreateLease = user && (user.role === 'ADMIN' || user.role === 'LANDLORD' || user.role === 'PROPERTY_MANAGER');
  
  if (!canCreateLease) {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to create lease agreements."
        action={{
          label: "Back to Dashboard",
          onClick: () => navigate(ROUTES.DASHBOARD),
        }}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Create Lease Agreement" 
        subtitle="Add a new lease for a property"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Basic Lease Information */}
          <Card title="Lease Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Select
                  id="property_id"
                  label="Property"
                  options={properties.map(property => ({
                    value: property.id.toString(),
                    label: `${property.name} (${property.address}, ${property.city})`
                  }))}
                  value={values.property_id}
                  error={errors.property_id}
                  onChange={(value) => {
                    setValue('property_id', value);
                    // Update rent and deposit based on selected property
                    const property = properties.find(p => p.id.toString() === value);
                    if (property) {
                      setValue('rent_amount', property.monthly_rent.toString());
                      setValue('deposit_amount', property.deposit_amount.toString());
                    }
                  }}
                />
                {isLoadingProperties && (
                  <p className="text-sm text-gray-500 mt-1">Loading properties...</p>
                )}
              </div>
              
              <div>
                <Select
                  id="tenant_id"
                  label="Tenant"
                  options={tenants.map(tenant => ({
                    value: tenant.id.toString(),
                    label: `${tenant.first_name} ${tenant.last_name} (${tenant.email})`
                  }))}
                  value={values.tenant_id}
                  error={errors.tenant_id}
                  onChange={(value) => setValue('tenant_id', value)}
                />
                {isLoadingTenants && (
                  <p className="text-sm text-gray-500 mt-1">Loading tenants...</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <DatePicker
                id="start_date"
                label="Start Date"
                value={values.start_date ? new Date(values.start_date) : undefined}
                error={errors.start_date}
                onChange={(date) => setValue('start_date', date.toISOString().split('T')[0])}
                minDate={new Date()}
              />
              
              <DatePicker
                id="end_date"
                label="End Date"
                value={values.end_date ? new Date(values.end_date) : undefined}
                error={errors.end_date}
                onChange={(date) => setValue('end_date', date.toISOString().split('T')[0])}
                minDate={values.start_date ? new Date(values.start_date) : new Date()}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                id="rent_amount"
                label="Monthly Rent ($)"
                type="number"
                min="0"
                step="0.01"
                value={values.rent_amount}
                error={errors.rent_amount}
                onChange={(e) => setValue('rent_amount', e.target.value)}
              />
              
              <Input
                id="deposit_amount"
                label="Security Deposit ($)"
                type="number"
                min="0"
                step="0.01"
                value={values.deposit_amount}
                error={errors.deposit_amount}
                onChange={(e) => setValue('deposit_amount', e.target.value)}
              />
            </div>
            
            <div>
              <Select
                id="is_active"
                label="Lease Status"
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
                value={values.is_active}
                error={errors.is_active}
                onChange={(value) => setValue('is_active', value)}
              />
            </div>
          </Card>
          
          {/* Lease Document */}
          <Card title="Lease Document">
            <FileUpload
              label="Upload Lease Document"
              accept=".pdf,.doc,.docx"
              onChange={(files) => setLeaseDocument(files[0])}
              hint="Upload a signed lease agreement document (PDF or Word document)"
            />
          </Card>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.LEASES)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Create Lease
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeaseCreate;