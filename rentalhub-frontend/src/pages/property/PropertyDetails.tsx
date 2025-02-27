// src/pages/property/PropertyDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PropertyService } from '../../services/property.service';
import { LeaseService } from '../../services/lease.service';
import { Property, Lease } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { formatCurrency } from '../../utils/formatters';

import PageHeader from '../../components/layout/PageHeader';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyDetailsCard from '../../components/property/PropertyDetailsCard';
import LeaseInfoCard from '../../components/leases/LeaseInfoCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import StatusIndicator from '../../components/common/StatusIndicator';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPropertyData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const propertyId = parseInt(id);
      
      // Fetch property details
      const propertyData = await PropertyService.getProperty(propertyId);
      setProperty(propertyData);
      
      // Fetch leases for this property
      const leasesData = await LeaseService.getLeases({ property_id: propertyId });
      setLeases(leasesData);
      
      // Fetch property statistics (only for landlords and property managers)
      if (user?.role === 'LANDLORD' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'ADMIN') {
        const statsData = await PropertyService.getPropertyStatistics(propertyId);
        setStatistics(statsData);
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPropertyData();
  }, [id, user]);
  
  // Check if user can edit this property
  const canEditProperty = property && user && (
    user.role === 'ADMIN' || 
    (user.role === 'LANDLORD' && property.owner_id === user.id) ||
    (user.role === 'PROPERTY_MANAGER' && property.property_manager_id === user.id)
  );
  
  // Check if user can add a lease to this property
  const canAddLease = property && user && (
    user.role === 'ADMIN' || 
    (user.role === 'LANDLORD' && property.owner_id === user.id) ||
    (user.role === 'PROPERTY_MANAGER' && property.property_manager_id === user.id)
  ) && property.status === 'AVAILABLE';
  
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
  
  const activeLeases = leases.filter(lease => lease.is_active);
  const pastLeases = leases.filter(lease => !lease.is_active);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={property.name}
        subtitle={`${property.address}, ${property.city}, ${property.state} ${property.zip_code}`}
        actions={
          <div className="flex space-x-4">
            {canEditProperty && (
              <Link to={ROUTES.PROPERTY_EDIT(property.id)}>
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Property
                </Button>
              </Link>
            )}
            {canAddLease && (
              <Link to={`${ROUTES.LEASE_CREATE}?property_id=${property.id}`}>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Lease
                </Button>
              </Link>
            )}
          </div>
        }
      />
      
      {/* Status Badge */}
      <div className="flex justify-end">
        <StatusIndicator type="property" status={property.status} />
      </div>
      
      {/* Property Gallery and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PropertyGallery images={property.images || []} />
        </div>
        <div>
          <PropertyDetailsCard property={property} />
        </div>
      </div>
      
      {/* Property Statistics (for landlords and property managers) */}
      {statistics && (user?.role === 'LANDLORD' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'ADMIN') && (
        <Card title="Property Statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Leases</h3>
              <p className="text-2xl font-bold">{statistics.lease_statistics.total_leases}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Current Leases</h3>
              <p className="text-2xl font-bold">{statistics.lease_statistics.current_leases}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Lease Duration</h3>
              <p className="text-2xl font-bold">{statistics.lease_statistics.average_lease_duration_days} days</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Collection Rate</h3>
              <p className="text-2xl font-bold">{statistics.financial_statistics.collection_rate}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Financial Overview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Invoiced</p>
                    <p className="font-medium">{formatCurrency(statistics.financial_statistics.total_invoiced)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Collected</p>
                    <p className="font-medium">{formatCurrency(statistics.financial_statistics.total_collected)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Overview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="font-medium">{statistics.maintenance_statistics.total_requests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maintenance Cost</p>
                    <p className="font-medium">{formatCurrency(statistics.maintenance_statistics.total_maintenance_cost)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Active Leases */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Leases</h2>
          {canAddLease && (
            <Link to={`${ROUTES.LEASE_CREATE}?property_id=${property.id}`}>
              <Button size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lease
              </Button>
            </Link>
          )}
        </div>
        
        {activeLeases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLeases.map((lease) => (
              <LeaseInfoCard 
                key={lease.id} 
                lease={lease} 
                onViewDetails={() => navigate(ROUTES.LEASE_DETAILS(lease.id))}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active leases"
            description={
              property.status === 'AVAILABLE' 
                ? "This property is available for rent." 
                : "This property has no active lease agreements."
            }
            action={
              canAddLease 
                ? {
                    label: "Create Lease",
                    onClick: () => navigate(`${ROUTES.LEASE_CREATE}?property_id=${property.id}`),
                  }
                : undefined
            }
          />
        )}
      </div>
      
      {/* Lease History (only show if there are past leases) */}
      {pastLeases.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pastLeases.map((lease) => (
                  <tr key={lease.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lease.tenant_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">{formatCurrency(lease.rent_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link to={ROUTES.LEASE_DETAILS(lease.id)} className="text-primary hover:text-primary-dark">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;