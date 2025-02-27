// src/pages/lease/LeaseDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LeaseService } from '../../services/lease.service';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentService } from '../../services/payment.service';
import { Lease, Invoice, Payment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { formatCurrency } from '../../utils/formatters';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusIndicator from '../../components/common/StatusIndicator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const LeaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lease, setLease] = useState<Lease | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  
  const fetchLeaseData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const leaseId = parseInt(id);
      
      // Fetch lease details
      const leaseData = await LeaseService.getLease(leaseId);
      setLease(leaseData);
      
      // Fetch invoices for this lease
      const invoicesData = await InvoiceService.getInvoices({ tenant_id: leaseData.tenant_id });
      // Filter to only include invoices for this lease
      const leaseInvoices = invoicesData.filter(invoice => invoice.lease_id === leaseId);
      setInvoices(leaseInvoices);
      
      // Fetch payments associated with these invoices
      if (leaseInvoices.length > 0) {
        const leasePayments: Payment[] = [];
        
        // For each invoice, get its payments
        for (const invoice of leaseInvoices) {
          const invoicePayments = await PaymentService.getPayments({ invoice_id: invoice.id });
          leasePayments.push(...invoicePayments);
        }
        
        setPayments(leasePayments);
      }
      
    } catch (err) {
      console.error('Error fetching lease details:', err);
      setError('Failed to load lease details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLeaseData();
  }, [id]);
  
  // Check if user has permission to view this lease
  const hasPermission = lease && user && (
    user.role === 'ADMIN' ||
    user.id === lease.tenant_id || // Tenant of this lease
    (user.role === 'LANDLORD' && lease.property_owner_id === user.id) || // Owner of the property
    (user.role === 'PROPERTY_MANAGER' && lease.property_manager_id === user.id) // Manager of the property
  );
  
  // Check if user can create invoices for this lease
  const canCreateInvoice = lease && user && lease.is_active && (
    user.role === 'ADMIN' ||
    (user.role === 'LANDLORD' && lease.property_owner_id === user.id) ||
    (user.role === 'PROPERTY_MANAGER' && lease.property_manager_id === user.id)
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !lease) {
    return (
      <EmptyState
        title="Error loading lease"
        description={error || "Lease not found"}
        action={{
          label: "Back to Leases",
          onClick: () => navigate(ROUTES.LEASES),
        }}
      />
    );
  }
  
  if (!hasPermission) {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to view this lease."
        action={{
          label: "Back to Dashboard",
          onClick: () => navigate(ROUTES.DASHBOARD),
        }}
      />
    );
  }
  
  const startDate = new Date(lease.start_date);
  const endDate = new Date(lease.end_date);
  const today = new Date();
  
  // Calculate lease duration in days
  const leaseDurationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate days remaining (or days overdue if negative)
  const daysRemaining = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate percentage of lease completed
  const leaseProgress = Math.min(100, Math.max(0, 100 - (daysRemaining / leaseDurationDays * 100)));
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Lease Details" 
        subtitle={`Lease agreement for ${lease.property_name}`}
        actions={
          canCreateInvoice ? (
            <Link to={`${ROUTES.INVOICE_CREATE}?lease_id=${lease.id}`}>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Invoice
              </Button>
            </Link>
			// src/pages/lease/LeaseDetails.tsx (continued)
          ) : null
        }
      />
      
      {/* Lease Status Banner */}
      <div className={`p-4 rounded-lg ${
        !lease.is_active 
          ? 'bg-red-50 border border-red-200' 
          : daysRemaining < 30 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`rounded-full w-3 h-3 mr-2 ${
              !lease.is_active 
                ? 'bg-red-500' 
                : daysRemaining < 30 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}></div>
            <span className="font-medium">
              {!lease.is_active 
                ? 'Inactive Lease' 
                : daysRemaining < 0 
                  ? 'Lease Expired' 
                  : daysRemaining < 30 
                    ? 'Lease Expiring Soon' 
                    : 'Active Lease'
              }
            </span>
          </div>
          <div>
            {lease.is_active && (
              <span className="text-sm">
                {daysRemaining < 0 
                  ? `Expired ${Math.abs(daysRemaining)} days ago` 
                  : daysRemaining === 0 
                    ? 'Expires today' 
                    : `${daysRemaining} days remaining`
                }
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Lease Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Lease Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Property</h3>
                <Link to={ROUTES.PROPERTY_DETAILS(lease.property_id)} className="text-primary hover:underline">
                  {lease.property_name}
                </Link>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tenant</h3>
                <Link to={ROUTES.TENANT_DETAILS(lease.tenant_id)} className="text-primary hover:underline">
                  {lease.tenant_name}
                </Link>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                <p>{startDate.toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                <p>{endDate.toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Rent</h3>
                <p className="text-lg font-semibold text-primary">{formatCurrency(lease.rent_amount)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Security Deposit</h3>
                <p>{formatCurrency(lease.deposit_amount)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Lease Term</h3>
                <p>{leaseDurationDays} days ({Math.round(leaseDurationDays / 30)} months)</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                  lease.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {lease.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {/* Lease Progress Bar */}
            {lease.is_active && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lease Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      daysRemaining < 0 ? 'bg-red-600' :
                      daysRemaining < 30 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${leaseProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{startDate.toLocaleDateString()}</span>
                  <span>{endDate.toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            {/* Lease Document */}
            {lease.lease_document && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lease Document</h3>
                <a 
                  href={lease.lease_document} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-50 border border-gray-200 rounded-md px-4 py-2 inline-flex items-center text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Lease Document
                </a>
              </div>
            )}
          </Card>
        </div>
        
        {/* Financial Summary */}
        <div className="lg:col-span-1">
          <Card title="Financial Summary">
            {/* Calculate totals */}
            {(() => {
              const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
              const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
              const outstandingBalance = totalInvoiced - totalPaid;
              
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Invoiced</h3>
                    <p className="text-lg font-semibold">{formatCurrency(totalInvoiced)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h3>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Outstanding Balance</h3>
                    <p className="text-lg font-semibold text-accent">{formatCurrency(outstandingBalance)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                      outstandingBalance <= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {outstandingBalance <= 0 ? 'Paid in Full' : 'Balance Due'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
      
      {/* Invoices and Payments Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
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
          </nav>
        </div>
        
        <div className="p-6">
          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Invoices</h3>
                {canCreateInvoice && (
                  <Link to={`${ROUTES.INVOICE_CREATE}?lease_id=${lease.id}`}>
                    <Button size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Invoice
                    </Button>
                  </Link>
                )}
              </div>
              
              {invoices.length === 0 ? (
                <EmptyState
                  title="No invoices"
                  description="No invoices have been created for this lease yet."
                  action={
                    canCreateInvoice
                      ? {
                          label: "Create Invoice",
                          onClick: () => navigate(`${ROUTES.INVOICE_CREATE}?lease_id=${lease.id}`),
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
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
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                            {formatCurrency(invoice.amount)}
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
            </>
          )}
          
          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <>
              <h3 className="text-lg font-medium mb-4">Payments</h3>
              
              {payments.length === 0 ? (
                <EmptyState
                  title="No payments"
                  description="No payments have been recorded for this lease yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
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
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                            {formatCurrency(payment.amount)}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaseDetails;