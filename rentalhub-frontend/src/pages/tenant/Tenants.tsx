// src/pages/tenant/Tenants.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserService } from '../../services/user.service';
import { LeaseService } from '../../services/lease.service';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { useDebounce } from '../../hooks/useDebounce';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

interface Tenant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_image?: string;
  leases_count?: number;
  active_lease?: boolean;
}

const Tenants: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Search for tenants
      const users = await UserService.searchUsers({
        role: 'TENANT',
        query: debouncedSearchTerm
      });
      
      // For each tenant, get their lease information
      const tenantsWithLeases = await Promise.all(
        users.map(async (user) => {
          try {
            const leases = await LeaseService.getLeases({ tenant_id: user.id });
            return {
              ...user,
              leases_count: leases.length,
              active_lease: leases.some(lease => lease.is_active)
            };
          } catch (error) {
            console.error(`Error fetching leases for tenant ${user.id}:`, error);
            return {
              ...user,
              leases_count: 0,
              active_lease: false
            };
          }
        })
      );
      
      setTenants(tenantsWithLeases);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to load tenants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTenants();
  }, [debouncedSearchTerm]);
  
  // Only landlords, property managers, and admins should access this page
  if (user?.role === 'TENANT') {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to view tenant information."
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tenants" 
        subtitle="Manage and track your tenants"
      />
      
      {/* Search and filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchTenants}>Refresh</Button>
        </div>
      </div>
      
      {/* Tenants List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading tenants"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchTenants,
          }}
        />
      ) : tenants.length === 0 ? (
        <EmptyState
          title="No tenants found"
          description={searchTerm ? "No tenants match your search criteria." : "No tenants have been added yet."}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leases
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar 
                          src={tenant.profile_image} 
                          name={`${tenant.first_name} ${tenant.last_name}`} 
                          size="md" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.first_name} {tenant.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.email}</div>
                    <div className="text-sm text-gray-500">{tenant.phone_number || 'No phone number'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.leases_count} {tenant.leases_count === 1 ? 'lease' : 'leases'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tenant.active_lease
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.active_lease ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={ROUTES.TENANT_DETAILS(tenant.id)} 
                      className="text-primary hover:text-primary-dark"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tenants;