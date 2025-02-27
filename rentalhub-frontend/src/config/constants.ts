// src/config/constants.ts
export const APP_NAME = 'RentalHub';
export const APP_VERSION = '1.0.0';

// API endpoints base path
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// File upload limits
export const MAX_FILE_SIZE = 5; // In MB
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/gif';
export const ACCEPTED_DOCUMENT_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.txt';

// Property constants
export const PROPERTY_CATEGORIES = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
];

export const PROPERTY_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Under Maintenance' },
];

// Maintenance constants
export const MAINTENANCE_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'EMERGENCY', label: 'Emergency' },
];

export const MAINTENANCE_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Invoice constants
export const INVOICE_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
];

// User roles
export const USER_ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'LANDLORD', label: 'Landlord' },
  { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
  { value: 'TENANT', label: 'Tenant' },
];