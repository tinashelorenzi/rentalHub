// src/pages/Reports.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PropertyService } from '../services/property.service';
import { LeaseService } from '../services/lease.service';
import { InvoiceService } from '../services/invoice.service';
import { MaintenanceService } from '../services/maintenance.service';
import { formatCurrency } from '../utils/formatters';
import { ROUTES } from '../config/routes';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/forms/Select';
import DatePicker from '../components/forms/DatePicker';
import RevenueChart from '../components/dashboard/RevenueChart';
import OccupancyRateChart from '../components/dashboard/OccupancyRateChart';
import PropertyStatusChart from '../components/dashboard/PropertyStatusChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
// src/pages/Reports.tsx (continued)
import EmptyState from '../components/common/EmptyState';

import { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PaymentService } from '../services/payment.service';
import PieChartDisplay from '../components/common/PieChartDisplay';

// Report types
type ReportType = 'financial' | 'occupancy' | 'maintenance' | 'leases';

// Date ranges
type DateRange = '30days' | '90days' | '6months' | '1year' | 'custom';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report selection
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Report data
  const [financialData, setFinancialData] = useState<any>(null);
  const [occupancyData, setOccupancyData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [leaseData, setLeaseData] = useState<any>(null);
  
  // Calculate date range based on selection
  useEffect(() => {
    const now = new Date();
    
    switch (dateRange) {
      case '30days':
        setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case '90days':
        setStartDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case '6months':
        setStartDate(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
        setEndDate(now);
        break;
      case '1year':
        setStartDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
        setEndDate(now);
        break;
      case 'custom':
        // Don't modify dates for custom range
        break;
      default:
        break;
    }
  }, [dateRange]);
  
  // Fetch report data when report type or date range changes
  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate]);
  
  const fetchReportData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      switch (reportType) {
        case 'financial':
          await fetchFinancialReport();
          break;
        case 'occupancy':
          await fetchOccupancyReport();
          break;
        case 'maintenance':
          await fetchMaintenanceReport();
          break;
        case 'leases':
          await fetchLeaseReport();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${reportType} report:`, err);
      setError(`Failed to load ${reportType} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch financial report data
  const fetchFinancialReport = async () => {
    // In a real application, you would call an API endpoint with date filters
    // For now, we'll simulate with mock data
    
    // Get all invoices and payments
    const invoices = await InvoiceService.getInvoices();
    const payments = await PaymentService.getPayments();
    
    // Filter by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.created_at);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
    
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    // Calculate monthly revenue and expenses
    const monthlyData: any = {};
    
    // Process invoices (revenue)
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.created_at);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: 0,
          expenses: 0,
        };
      }
      
      monthlyData[monthYear].revenue += invoice.amount;
    });
    
    // Process maintenance costs (expenses)
    const maintenanceRequests = await MaintenanceService.getMaintenanceRequests();
    
    maintenanceRequests
      .filter(request => request.status === 'RESOLVED' && request.actual_cost)
      .forEach(request => {
        if (!request.resolved_at) return;
        
        const date = new Date(request.resolved_at);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: 0,
            expenses: 0,
          };
        }
        
        monthlyData[monthYear].expenses += request.actual_cost || 0;
      });
    
    // Convert to array and sort by date
    const chartData = Object.values(monthlyData).sort((a: any, b: any) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    // Calculate totals
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalExpenses = maintenanceRequests
      .filter(request => request.status === 'RESOLVED' && request.actual_cost && new Date(request.resolved_at || '') >= startDate && new Date(request.resolved_at || '') <= endDate)
      .reduce((sum, request) => sum + (request.actual_cost || 0), 0);
    const totalCollected = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue * 100).toFixed(2) : '0';
    
    setFinancialData({
      chartData,
      summary: {
        totalRevenue,
        totalExpenses,
        totalCollected,
        collectionRate,
        netIncome: totalRevenue - totalExpenses,
      }
    });
  };
  
  // Fetch occupancy report data
  const fetchOccupancyReport = async () => {
    // Get all properties and leases
    const properties = await PropertyService.getProperties();
    const leases = await LeaseService.getLeases();
    
    // Calculate monthly occupancy rates
    const monthlyData: any = {};
    
    // Process each month in the date range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthYear = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
      const monthLabel = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Count occupied properties for this month
      const activeLeases = leases.filter(lease => {
        const leaseStart = new Date(lease.start_date);
        const leaseEnd = new Date(lease.end_date);
        
        return leaseStart <= currentDate && leaseEnd >= currentDate;
      });
      
      const uniqueProperties = new Set(activeLeases.map(lease => lease.property_id));
      const occupiedCount = uniqueProperties.size;
      const totalPropertiesCount = properties.length;
      const rate = totalPropertiesCount > 0 ? Math.round((occupiedCount / totalPropertiesCount) * 100) : 0;
      
      monthlyData[monthYear] = {
        month: monthLabel,
        rate,
        occupiedCount,
        totalCount: totalPropertiesCount,
      };
      
      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    // Convert to array and sort by date
    const chartData = Object.values(monthlyData).sort((a: any, b: any) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    // Calculate current property status
    const availableCount = properties.filter(p => p.status === 'AVAILABLE').length;
    const rentedCount = properties.filter(p => p.status === 'RENTED').length;
    const maintenanceCount = properties.filter(p => p.status === 'MAINTENANCE').length;
    
    const currentOccupancyRate = properties.length > 0 
      ? Math.round((rentedCount / properties.length) * 100) 
      : 0;
    
    setOccupancyData({
      chartData,
      summary: {
        currentOccupancyRate,
        totalProperties: properties.length,
        availableCount,
        rentedCount,
        maintenanceCount,
      },
      statusData: [
        { status: 'Available', count: availableCount },
        { status: 'Rented', count: rentedCount },
        { status: 'Maintenance', count: maintenanceCount },
      ]
    });
  };
  
  // Fetch maintenance report data
  const fetchMaintenanceReport = async () => {
    // Get all maintenance requests
    const maintenanceRequests = await MaintenanceService.getMaintenanceRequests();
    
    // Filter by date range
    const filteredRequests = maintenanceRequests.filter(request => {
      const requestDate = new Date(request.created_at);
      return requestDate >= startDate && requestDate <= endDate;
    });
    
    // Calculate status counts
    const pendingCount = filteredRequests.filter(r => r.status === 'PENDING').length;
    const inProgressCount = filteredRequests.filter(r => r.status === 'IN_PROGRESS').length;
    const resolvedCount = filteredRequests.filter(r => r.status === 'RESOLVED').length;
    const cancelledCount = filteredRequests.filter(r => r.status === 'CANCELLED').length;
    
    // Calculate priority counts
    const lowCount = filteredRequests.filter(r => r.priority === 'LOW').length;
    const mediumCount = filteredRequests.filter(r => r.priority === 'MEDIUM').length;
    const highCount = filteredRequests.filter(r => r.priority === 'HIGH').length;
    const emergencyCount = filteredRequests.filter(r => r.priority === 'EMERGENCY').length;
    
    // Calculate average resolution time
    const resolvedRequests = filteredRequests.filter(r => r.status === 'RESOLVED' && r.resolved_at);
    let totalResolutionDays = 0;
    
    resolvedRequests.forEach(request => {
      if (!request.resolved_at) return;
      
      const created = new Date(request.created_at);
      const resolved = new Date(request.resolved_at);
      const days = Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      totalResolutionDays += days;
    });
    
    const averageResolutionDays = resolvedRequests.length > 0 
      ? Math.round(totalResolutionDays / resolvedRequests.length) 
      : 0;
    
    // Calculate total maintenance costs
    const totalCost = resolvedRequests.reduce((sum, request) => sum + (request.actual_cost || 0), 0);
    
    setMaintenanceData({
      summary: {
        totalRequests: filteredRequests.length,
        pendingCount,
        inProgressCount,
        resolvedCount,
        cancelledCount,
        averageResolutionDays,
        totalCost,
      },
      statusData: [
        { name: 'Pending', value: pendingCount },
        { name: 'In Progress', value: inProgressCount },
        { name: 'Resolved', value: resolvedCount },
        { name: 'Cancelled', value: cancelledCount },
      ],
      priorityData: [
        { name: 'Low', value: lowCount },
        { name: 'Medium', value: mediumCount },
        { name: 'High', value: highCount },
        { name: 'Emergency', value: emergencyCount },
      ]
    });
  };
  
  // Fetch lease report data
  const fetchLeaseReport = async () => {
    // Get all leases
    const leases = await LeaseService.getLeases();
    
    // Filter by date range (leases that started or ended within the range)
    const filteredLeases = leases.filter(lease => {
      const startDateObj = new Date(lease.start_date);
      const endDateObj = new Date(lease.end_date);
      
      return (startDateObj >= startDate && startDateObj <= endDate) || 
             (endDateObj >= startDate && endDateObj <= endDate);
    });
    
    // Calculate active vs. inactive leases
    const activeLeases = filteredLeases.filter(lease => lease.is_active);
    const inactiveLeases = filteredLeases.filter(lease => !lease.is_active);
    
    // Calculate leases expiring in the next 30, 60, 90 days
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const expiringIn30Days = activeLeases.filter(lease => {
      const endDateObj = new Date(lease.end_date);
      return endDateObj <= next30Days;
    });
    
    const expiringIn60Days = activeLeases.filter(lease => {
      const endDateObj = new Date(lease.end_date);
      return endDateObj <= next60Days && endDateObj > next30Days;
    });
    
    const expiringIn90Days = activeLeases.filter(lease => {
      const endDateObj = new Date(lease.end_date);
      return endDateObj <= next90Days && endDateObj > next60Days;
    });
    
    // Calculate average lease duration
    let totalDuration = 0;
    
    filteredLeases.forEach(lease => {
      const startDateObj = new Date(lease.start_date);
      const endDateObj = new Date(lease.end_date);
      const duration = Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      totalDuration += duration;
    });
    
    const averageDuration = filteredLeases.length > 0 
      ? Math.round(totalDuration / filteredLeases.length) 
      : 0;
    
    setLeaseData({
      summary: {
        totalLeases: filteredLeases.length,
        activeLeases: activeLeases.length,
        inactiveLeases: inactiveLeases.length,
        expiringIn30Days: expiringIn30Days.length,
        expiringIn60Days: expiringIn60Days.length,
        expiringIn90Days: expiringIn90Days.length,
        averageDuration,
      },
      leaseStatus: [
        { name: 'Active', value: activeLeases.length },
        { name: 'Inactive', value: inactiveLeases.length },
      ],
      expiringLeases: [
        { name: '30 Days', value: expiringIn30Days.length },
        { name: '60 Days', value: expiringIn60Days.length },
        { name: '90 Days', value: expiringIn90Days.length },
      ]
    });
  };
  
  // Handle report export
  const handleExportReport = () => {
    // In a real application, this would generate a CSV or PDF file
    alert('Export functionality would generate a downloadable report file.');
  };
  
  // Only landlords, property managers, and admins should access this page
  if (user?.role === 'TENANT') {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to view reports."
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        subtitle="Generate and view detailed property management reports"
        actions={
          <Button onClick={handleExportReport}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </Button>
        }
      />
      
      {/* Report Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Select
              id="reportType"
              label="Report Type"
              options={[
                { value: 'financial', label: 'Financial Report' },
                { value: 'occupancy', label: 'Occupancy Report' },
                { value: 'maintenance', label: 'Maintenance Report' },
                { value: 'leases', label: 'Lease Report' },
              ]}
              value={reportType}
              onChange={(value) => setReportType(value as ReportType)}
            />
          </div>
          
          <div>
            <Select
              id="dateRange"
              label="Date Range"
              options={[
                { value: '30days', label: 'Last 30 Days' },
                { value: '90days', label: 'Last 90 Days' },
                { value: '6months', label: 'Last 6 Months' },
                { value: '1year', label: 'Last Year' },
                { value: 'custom', label: 'Custom Range' },
              ]}
              value={dateRange}
              onChange={(value) => setDateRange(value as DateRange)}
            />
          </div>
          
          {dateRange === 'custom' && (
            <>
              <div>
                <DatePicker
                  id="startDate"
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  maxDate={endDate}
                />
              </div>
              
              <div>
                <DatePicker
                  id="endDate"
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate}
                />
              </div>
            </>
          )}
        </div>
      </Card>
      
      {/* Report Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading report"
          description={error}
          action={{
            label: "Try Again",
            onClick: fetchReportData,
          }}
        />
      ) : (
        // Render different report types
        <>
          {reportType === 'financial' && financialData && (
            <FinancialReport data={financialData} />
          )}
          
          {reportType === 'occupancy' && occupancyData && (
            <OccupancyReport data={occupancyData} />
          )}
          
          {reportType === 'maintenance' && maintenanceData && (
            <MaintenanceReport data={maintenanceData} />
          )}
          
          {reportType === 'leases' && leaseData && (
            <LeaseReport data={leaseData} />
          )}
        </>
      )}
    </div>
  );
};

// Financial Report Component
const FinancialReport: React.FC<{ data: any }> = ({ data }) => {
  const { chartData, summary } = data;
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalRevenue)}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-accent">{formatCurrency(summary.totalExpenses)}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Net Income</h3>
          <p className="text-2xl font-bold text-secondary">{formatCurrency(summary.netIncome)}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Collection Rate</h3>
          <p className="text-2xl font-bold">{summary.collectionRate}%</p>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <Card title="Revenue & Expenses">
        <div className="h-80">
          <RevenueChart data={chartData} />
        </div>
      </Card>
    </div>
  );
};

// Occupancy Report Component
const OccupancyReport: React.FC<{ data: any }> = ({ data }) => {
  const { chartData, summary, statusData } = data;
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Current Occupancy Rate</h3>
          <p className="text-2xl font-bold text-primary">{summary.currentOccupancyRate}%</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Properties</h3>
          <p className="text-2xl font-bold">{summary.totalProperties}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Rented Properties</h3>
          <p className="text-2xl font-bold text-secondary">{summary.rentedCount}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Available Properties</h3>
          <p className="text-2xl font-bold text-accent">{summary.availableCount}</p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Occupancy Rate Trend">
          <div className="h-80">
            <OccupancyRateChart data={chartData} />
          </div>
        </Card>
        
        <Card title="Property Status Distribution">
          <div className="h-80">
            <PropertyStatusChart data={statusData} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Maintenance Report Component
const MaintenanceReport: React.FC<{ data: any }> = ({ data }) => {
  const { summary, statusData, priorityData } = data;
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Requests</h3>
          <p className="text-2xl font-bold">{summary.totalRequests}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Requests</h3>
          <p className="text-2xl font-bold text-accent">{summary.pendingCount}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold text-primary">{summary.averageResolutionDays} days</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Maintenance Cost</h3>
          <p className="text-2xl font-bold text-secondary">{formatCurrency(summary.totalCost)}</p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Requests by Status">
          <div className="h-80">
            <PieChartDisplay data={statusData} />
          </div>
        </Card>
        
        <Card title="Requests by Priority">
          <div className="h-80">
            <PieChartDisplay data={priorityData} colors={['#3498db', '#f39c12', '#e74c3c', '#c0392b']} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Lease Report Component
const LeaseReport: React.FC<{ data: any }> = ({ data }) => {
  const { summary, leaseStatus, expiringLeases } = data;
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Leases</h3>
          <p className="text-2xl font-bold">{summary.totalLeases}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Leases</h3>
          <p className="text-2xl font-bold text-secondary">{summary.activeLeases}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Expiring in 30 Days</h3>
          <p className="text-2xl font-bold text-accent">{summary.expiringIn30Days}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Lease Duration</h3>
          <p className="text-2xl font-bold text-primary">{summary.averageDuration} days</p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Lease Status">
          <div className="h-80">
            <PieChartDisplay data={leaseStatus} colors={['#27ae60', '#e74c3c']} />
          </div>
        </Card>
        
        <Card title="Expiring Leases">
          <div className="h-80">
            <BarChartDisplay data={expiringLeases} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Simple Pie Chart Display Component
const PieChartDisplay: React.FC<{ data: any[], colors?: string[] }> = ({ data, colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Simple Bar Chart Display Component
const BarChartDisplay: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name="Count" fill="#3498db" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Reports;