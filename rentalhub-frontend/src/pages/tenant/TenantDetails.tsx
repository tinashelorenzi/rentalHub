// src/pages/tenant/TenantDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserService } from '../../services/user.service';
import { LeaseService } from '../../services/lease.service';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentService } from '../../services/payment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { User, Lease, Invoice, Payment, MaintenanceRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { formatCurrency, formatPhoneNumber } from '../../utils/formatters';

import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LeaseInfoCard from '../../components/leases/LeaseInfoCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusIndicator from '../../components/common/StatusIndicator';

const TenantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tenant, setTenant] = useState<User | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'leases' | 'invoices' | 'payments' | 'maintenance'>('leases');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTenantData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const tenantId = parseInt(id);
      
      // In a real application, we would have an endpoint to get a specific user
      // For now, we'll simulate it by searching users
      const users = await UserService.searchUsers({ role: 'TENANT' });
      const foundTenant = users.find(u => u.id === tenantId);
      
      if (!foundTenant) {
        setError('Tenant not found');
        setIsLoading(false);
        return;
      }
      
      setTenant(foundTenant as User);
      
      // Fetch leases for this tenant
      const leasesData = await LeaseService.getLeases({ tenant_id: tenantId });
      setLeases(leasesData);
      
      // Fetch invoices for this tenant
      const invoicesData = await InvoiceService.getInvoices({ tenant_id: tenantId });
      setInvoices(invoicesData);
      
      // Fetch payments for this tenant
      const paymentsData = await PaymentService.getPayments({ tenant_id: tenantId });
      setPayments(paymentsData);
      
      // Fetch maintenance requests for this tenant
      // In a real application, we might need a specific endpoint for this
      const allRequests = await MaintenanceService.getMaintenanceRequests();
      const tenantRequests = allRequests.filter(req => req.tenant_id === tenantId);
      setMaintenanceRequests(tenantRequests);
      
    } catch (err) {
      console.error('Error fetching tenant details:', err);
      setError('Failed to load tenant details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTenantData();
  }, [id]);
  
  // Only landlords, property managers, and admins should access this page
  if (user?.role === 'TENANT') {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to view tenant information."
      />
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !tenant) {
    return (
      <EmptyState
        title="Error loading tenant"
        description={error || "Tenant not found"}
        action={{
          label: "Back to Tenants",
          onClick: () => navigate(ROUTES.TENANTS),
        }}
      />
    );
  }
  
  const activeLeases = leases.filter(lease => lease.is_active);
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'PENDING' || invoice.status === 'OVERDUE');
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${tenant.first_name} ${tenant.last_name}`}
        subtitle="Tenant Details"
        actions={
          <div className="flex space-x-4">
            {activeLeases.length === 0 && (
              <Link to={`${ROUTES.LEASE_CREATE}?tenant_id=${tenant.id}`}>
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
      
      {/* Tenant Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <Avatar 
              src={tenant.profile_image} 
              name={`${tenant.first_name} ${tenant.last_name}`} 
              size="xl" 
            />
            <h2 className="mt-4 text-xl font-semibold">{tenant.first_name} {tenant.last_name}</h2>
            <p className="text-gray-600">{tenant.email}</p>
            {tenant.phone_number && (
              <p className="text-gray-600">{formatPhoneNumber(tenant.phone_number)}</p>
            )}
            <div className="mt-4">
              <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                activeLeases.length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activeLeases.length > 0 ? 'Active Tenant' : 'Inactive Tenant'}
              </span>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Tenant Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Leases:</span>
                <span className="font-medium">{activeLeases.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Leases:</span>
                <span className="font-medium">{leases.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Invoices:</span>
                <span className="font-medium">{pendingInvoices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-medium">{payments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance Requests:</span>
                <span className="font-medium">{maintenanceRequests.length}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'leases'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('leases')}
                >
                  Leases
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'invoices'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('invoices')}
                >
                  Invoices
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'payments'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'maintenance'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('maintenance')}
                >
                  Maintenance
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {/* Leases Tab */}
              {activeTab === 'leases' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Lease Agreements</h3>
                    {activeLeases.length === 0 && (
                      <Link to={`${ROUTES.LEASE_CREATE}?tenant_id=${tenant.id}`}>
                        <Button size="sm">
                          New Lease
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {leases.length === 0 ? (
                    <EmptyState
                      title="No lease agreements"
                      description="This tenant has no lease agreements."
                      action={{
                        label: "Create Lease",
                        onClick: () => navigate(`${ROUTES.LEASE_CREATE}?tenant_id=${tenant.id}`),
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {leases.map(lease => (
                        <LeaseInfoCard 
                          key={lease.id}
                          lease={lease}
                          onViewDetails={() => navigate(ROUTES.LEASE_DETAILS(lease.id))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Invoices</h3>
                    {activeLeases.length > 0 && (
                      <Link to={`${ROUTES.INVOICE_CREATE}?tenant_id=${tenant.id}`}>
                        <Button size="sm">
                          New Invoice
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {invoices.length === 0 ? (
                    <EmptyState
                      title="No invoices"
                      description="This tenant has no invoices."
                      action={
                        activeLeases.length > 0
                          ? {
                              label: "Create Invoice",
                              onClick: () => navigate(`${ROUTES.INVOICE_CREATE}?tenant_id=${tenant.id}`),
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoices.map(invoice => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{invoice.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {invoice.property_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                {formatCurrency(invoice.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(invoice.due_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusIndicator type="invoice" status={invoice.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={ROUTES.INVOICE_DETAILS(invoice.id)} className="text-primary hover:text-primary-dark">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment History</h3>
                  
                  {payments.length === 0 ? (
                    <EmptyState
                      title="No payment history"
                      description="This tenant has no payment history."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{payment.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                #{payment.invoice_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.payment_method.replace('_', ' ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={ROUTES.PAYMENT_DETAILS(payment.id)} className="text-primary hover:text-primary-dark">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* Maintenance Tab */}
              {activeTab === 'maintenance' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Maintenance Requests</h3>
                  
                  {maintenanceRequests.length === 0 ? (
                    <EmptyState
                      title="No maintenance requests"
                      description="This tenant has not submitted any maintenance requests."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {maintenanceRequests.map(request => (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{request.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.property_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusIndicator type="priority" status={request.priority} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusIndicator type="maintenance" status={request.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(request.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={ROUTES.MAINTENANCE_DETAILS(request.id)} className="text-primary hover:text-primary-dark">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;