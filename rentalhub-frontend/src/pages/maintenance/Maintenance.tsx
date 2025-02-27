// src/pages/maintenance/Maintenance.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from '../../config/constants';
import { useDebounce } from '../../hooks/useDebounce';

import PageHeader from '../../components/layout/PageHeader';
import MaintenanceRequestCard from '../../components/dashboard/MaintenanceRequestCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Maintenance: React.FC = () => {
  const { user } = useAuth();
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const fetchMaintenanceRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await MaintenanceService.getMaintenanceRequests();
      setMaintenanceRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError('Failed to load maintenance requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    let result = [...maintenanceRequests];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter) {
      result = result.filter(request => request.priority === priorityFilter);
    }
    
    // Apply search term (search in title, description, and property name)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(request => 
        request.title.toLowerCase().includes(term) ||
        request.description.toLowerCase().includes(term) ||
        (request.property_name && request.property_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredRequests(result);
  }, [maintenanceRequests, statusFilter, priorityFilter, debouncedSearchTerm]);
  
  // Check if user can create maintenance requests
  const canCreateRequest = !!user;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Maintenance Requests" 
        subtitle="Manage and track maintenance requests"
        actions={
          canCreateRequest ? (
            <Link to={ROUTES.MAINTENANCE_CREATE}>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Request
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
            placeholder="Search maintenance requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            id="status"
            placeholder="Status"
            options={[
              { value: '', label: 'All Statuses' },
              ...MAINTENANCE_STATUSES
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <Select
            id="priority"
            placeholder="Priority"
            options={[
              { value: '', label: 'All Priorities' },
              ...MAINTENANCE_PRIORITIES
            ]}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPriorityFilter('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Maintenance Requests List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading maintenance requests"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchMaintenanceRequests,
          }}
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No maintenance requests found"
          description={
            (statusFilter || priorityFilter || debouncedSearchTerm)
              ? "No maintenance requests match your search criteria."
              : "No maintenance requests have been created yet."
          }
          action={
            canCreateRequest
              ? {
                  label: "Create Request",
                  onClick: () => window.location.href = ROUTES.MAINTENANCE_CREATE,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <MaintenanceRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Maintenance;