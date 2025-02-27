// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import PropertyCard from '../components/dashboard/PropertyCard';
import MaintenanceRequestCard from '../components/dashboard/MaintenanceRequestCard';
import InvoiceCard from '../components/dashboard/InvoiceCard';
import PropertyStatusChart from '../components/dashboard/PropertyStatusChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import OccupancyRateChart from '../components/dashboard/OccupancyRateChart';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { DashboardService } from '../services/dashboard.service';
import { Property, MaintenanceRequest, Invoice } from '../types';
import { ROUTES } from '../config/routes';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        let data;

        if (user?.role === 'LANDLORD') {
          data = await DashboardService.getLandlordSummary();
        } else if (user?.role === 'TENANT') {
          data = await DashboardService.getTenantSummary();
        } else if (user?.role === 'PROPERTY_MANAGER') {
          data = await DashboardService.getPropertyManagerSummary();
        } else {
          // Admin or fallback
          data = await DashboardService.getLandlordSummary();
        }

        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        // src/pages/Dashboard.tsx (continued)
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <PageHeader title="Dashboard" />
        <EmptyState
          title="Error loading dashboard"
          description={error}
          action={{
            label: "Try Again",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Render different dashboards based on user role
  if (user?.role === 'TENANT') {
    return <TenantDashboard data={dashboardData} />;
  } else if (user?.role === 'PROPERTY_MANAGER') {
    return <PropertyManagerDashboard data={dashboardData} />;
  } else {
    // Landlord or Admin
    return <LandlordDashboard data={dashboardData} />;
  }
};

// Landlord Dashboard View
const LandlordDashboard: React.FC<{ data: any }> = ({ data }) => {
  const { properties_summary, financial_summary, maintenance_summary, recent_leases, recent_payments } = data;
  
  // Prepare chart data
  const propertyStatusData = [
    { status: 'Available', count: properties_summary.available },
    { status: 'Occupied', count: properties_summary.occupied },
    { status: 'Maintenance', count: properties_summary.under_maintenance },
  ];
  
  // Sample revenue data (in a real app, this would come from the API)
  const revenueData = [
    { month: 'Jan', revenue: 12500, expenses: 4500 },
    { month: 'Feb', revenue: 13200, expenses: 4800 },
    { month: 'Mar', revenue: 13100, expenses: 5100 },
    { month: 'Apr', revenue: 14200, expenses: 5300 },
    { month: 'May', revenue: 13800, expenses: 5200 },
    { month: 'Jun', revenue: 14500, expenses: 5400 },
  ];
  
  // Sample occupancy data
  const occupancyData = [
    { month: 'Jan', rate: 82 },
    { month: 'Feb', rate: 86 },
    { month: 'Mar', rate: 84 },
    { month: 'Apr', rate: 88 },
    { month: 'May', rate: 90 },
    { month: 'Jun', rate: properties_summary.occupancy_rate },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back! Here's an overview of your properties.`}
      />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={properties_summary.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <StatCard
          title="Occupancy Rate"
          value={`${properties_summary.occupancy_rate}%`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="secondary"
        />
        <StatCard
          title="Pending Invoices"
          value={financial_summary.pending_invoices}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="accent"
        />
        <StatCard
          title="Maintenance Requests"
          value={maintenance_summary.pending_requests + maintenance_summary.in_progress_requests}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="neutral"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PropertyStatusChart data={propertyStatusData} />
        <RevenueChart data={revenueData} />
        <OccupancyRateChart data={occupancyData} />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leases */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leases</h2>
            <Link to={ROUTES.LEASES}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {recent_leases.length > 0 ? (
            <div className="space-y-4">
              {recent_leases.map((lease: any) => (
                <div key={lease.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{lease.property_name}</h3>
                      <p className="text-sm text-gray-500">Tenant: {lease.tenant_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">${lease.rent_amount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No recent leases" 
              description="No lease agreements have been created recently."
              action={{
                label: "Create Lease",
                onClick: () => window.location.href = ROUTES.LEASE_CREATE,
              }}
            />
          )}
        </div>
        
        {/* Recent Payments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <Link to={ROUTES.PAYMENTS}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {recent_payments.length > 0 ? (
            <div className="space-y-4">
              {recent_payments.map((payment: any) => (
                <div key={payment.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">Payment #{payment.id}</h3>
                      <p className="text-sm text-gray-500">From: {payment.tenant_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">${payment.amount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No recent payments" 
              description="No payments have been received recently."
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Tenant Dashboard View
const TenantDashboard: React.FC<{ data: any }> = ({ data }) => {
  const { leases, invoices, maintenance_requests, recent_payments } = data;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's an overview of your rental information."
      />
      
      {/* Active Leases */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Leases</h2>
        {leases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map((lease: any) => (
              <div key={lease.id} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{lease.property_name}</h3>
                <p className="text-gray-500 mb-4">{lease.property_address}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Rent</p>
                    <p className="font-medium text-primary">${lease.rent_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lease Ends</p>
                    <p className="font-medium">{new Date(lease.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Lease Status</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${100 - (lease.days_remaining / 365 * 100)}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{lease.days_remaining} days remaining</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No active leases" 
            description="You don't have any active lease agreements."
          />
        )}
      </div>
      
      {/* Pending Invoices */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Invoices</h2>
          <Link to={ROUTES.INVOICES}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice: any) => (
              <InvoiceCard key={invoice.id} invoice={invoice as Invoice} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No pending invoices" 
            description="You don't have any pending invoices at the moment."
          />
        )}
      </div>
      
      {/* Maintenance Requests */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
          <div className="flex space-x-4">
            <Link to={ROUTES.MAINTENANCE_CREATE}>
              <Button size="sm">New Request</Button>
            </Link>
            <Link to={ROUTES.MAINTENANCE}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </div>
        
        {maintenance_requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenance_requests.map((request: any) => (
              <MaintenanceRequestCard key={request.id} request={request as MaintenanceRequest} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No maintenance requests" 
            description="You don't have any maintenance requests."
            action={{
              label: "Create Request",
              onClick: () => window.location.href = ROUTES.MAINTENANCE_CREATE,
            }}
          />
        )}
      </div>
      
      {/* Recent Payments */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          <Link to={ROUTES.PAYMENTS}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        {recent_payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recent_payments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.property_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No payment history" 
            description="You don't have any payment history yet."
          />
        )}
      </div>
    </div>
  );
};

// Property Manager Dashboard View
const PropertyManagerDashboard: React.FC<{ data: any }> = ({ data }) => {
  const { properties_summary, maintenance_summary, recent_maintenance_requests } = data;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's an overview of your managed properties."
      />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Managed Properties"
          value={properties_summary.managed_properties}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <StatCard
          title="Active Leases"
          value={properties_summary.active_leases}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="secondary"
        />
        <StatCard
          title="Expiring Leases"
          value={properties_summary.expiring_leases}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="accent"
        />
        <StatCard
          title="Maintenance Requests"
          value={maintenance_summary.pending_requests + maintenance_summary.in_progress_requests}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="neutral"
        />
      </div>
      
      {/* Maintenance Request Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Request Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
            <p className="text-2xl font-bold">{maintenance_summary.pending_requests}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-500 mb-1">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">{maintenance_summary.in_progress_requests}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-500 mb-1">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">{maintenance_summary.resolved_requests}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Resolution Time</h3>
            <p className="text-xl font-bold">{maintenance_summary.average_resolution_days || 'N/A'} days</p>
          </div>
        </div>
      </div>
      
      {/* Recent Maintenance Requests */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance Requests</h2>
          <Link to={ROUTES.MAINTENANCE}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        {recent_maintenance_requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent_maintenance_requests.map((request: any) => (
              <MaintenanceRequestCard key={request.id} request={request as MaintenanceRequest} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No maintenance requests" 
            description="There are no maintenance requests at the moment."
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;