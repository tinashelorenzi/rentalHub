// src/pages/property/Properties.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { PROPERTY_CATEGORIES, PROPERTY_STATUSES } from '../../config/constants';
import { useDebounce } from '../../hooks/useDebounce';

import PageHeader from '../../components/layout/PageHeader';
import PropertyCard from '../../components/dashboard/PropertyCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Properties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [maxRent, setMaxRent] = useState('');
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare filter parameters
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (minBedrooms) filters.min_bedrooms = parseInt(minBedrooms);
      if (maxRent) filters.max_rent = parseFloat(maxRent);
      if (debouncedSearchTerm) filters.city = debouncedSearchTerm;
      
      const data = await PropertyService.getProperties(filters);
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [debouncedSearchTerm, statusFilter, categoryFilter, minBedrooms, maxRent]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setMinBedrooms('');
    setMaxRent('');
  };
  
  // Check if user can add properties (landlords and admins)
  const canAddProperty = user?.role === 'LANDLORD' || user?.role === 'ADMIN';
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Properties" 
        subtitle="Manage and explore your property listings"
        actions={
          canAddProperty ? (
            <Link to={ROUTES.PROPERTY_CREATE}>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Property
              </Button>
            </Link>
          ) : null
        }
      />
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            id="search"
            placeholder="Search by city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            id="status"
            options={PROPERTY_STATUSES}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <Select
            id="category"
            options={PROPERTY_CATEGORIES}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          
          <Input
            id="minBedrooms"
            placeholder="Min. Bedrooms"
            type="number"
            min="0"
            // src/pages/property/Properties.tsx (continued)
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
          />
          
          <Input
            id="maxRent"
            placeholder="Max. Rent ($)"
            type="number"
            min="0"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Properties List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading properties"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchProperties,
          }}
        />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description={
            Object.keys({statusFilter, categoryFilter, minBedrooms, maxRent, debouncedSearchTerm}).some(k => !!k) 
              ? "Try adjusting your filters to see more results." 
              : "No properties have been added yet."
          }
          action={
            canAddProperty 
              ? {
                  label: "Add Property",
                  onClick: () => window.location.href = ROUTES.PROPERTY_CREATE,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;