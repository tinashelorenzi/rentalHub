// src/pages/lease/Leases.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeaseService } from '../../services/lease.service';
import { Lease } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { formatCurrency } from '../../utils/formatters';

import PageHeader from '../../components/layout/PageHeader';
import LeaseInfoCard from '../../components/leases/LeaseInfoCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Leases: React.FC = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await LeaseService.getLeases();
      setLeases(data);
      setFilteredLeases(data);
    } catch (err) {
      console.error('Error fetching leases:', err);
      setError('Failed to load leases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLeases();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    let result = [...leases];
    
    // Apply active/inactive filter
    if (activeFilter === 'active') {
      result = result.filter(lease => lease.is_active);
    } else if (activeFilter === 'inactive') {
      result = result.filter(lease => !lease.is_active);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lease => 
        lease.property_name.toLowerCase().includes(term) ||
        lease.tenant_name.toLowerCase().includes(term)
      );
    }
    
    setFilteredLeases(result);
  }, [leases, activeFilter, searchTerm]);
  
  // Check if user can create leases (landlords, property managers, and admins)
  const canCreateLease = user?.role === 'LANDLORD' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'ADMIN';
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leases" 
        subtitle="Manage and track your lease agreements"
        actions={
          canCreateLease ? (
            <Link to={ROUTES.LEASE_CREATE}>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Lease
              </Button>
            </Link>
          ) : null
        }
      />
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="search"
            placeholder="Search by property or tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            id="status"
            options={[
              { value: 'all', label: 'All Leases' },
              { value: 'active', label: 'Active Leases' },
              { value: 'inactive', label: 'Inactive Leases' },
            ]}
            value={activeFilter}
            onChange={setActiveFilter}
          />
          
          <div className="flex justify-end items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Leases List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading leases"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchLeases,
          }}
        />
      ) : filteredLeases.length === 0 ? (
        <EmptyState
          title="No leases found"
          description={
            searchTerm || activeFilter !== 'all'
              ? "No leases match your search criteria."
              : "No leases have been created yet."
          }
          action={
            canCreateLease
              ? {
                  label: "Create Lease",
                  onClick: () => window.location.href = ROUTES.LEASE_CREATE,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <LeaseInfoCard 
              key={lease.id} 
              lease={lease} 
              onViewDetails={() => window.location.href = ROUTES.LEASE_DETAILS(lease.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;