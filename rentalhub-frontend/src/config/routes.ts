// src/config/routes.ts
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Main routes
  DASHBOARD: '/dashboard',
  
  // Property routes
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: (id: number | string = ':id') => `/properties/${id}`,
  PROPERTY_EDIT: (id: number | string = ':id') => `/properties/${id}/edit`,
  PROPERTY_CREATE: '/properties/create',
  
  // Tenant routes
  TENANTS: '/tenants',
  TENANT_DETAILS: (id: number | string = ':id') => `/tenants/${id}`,
  
  // Lease routes
  LEASES: '/leases',
  LEASE_DETAILS: (id: number | string = ':id') => `/leases/${id}`,
  LEASE_CREATE: '/leases/create',
  LEASE_EDIT: (id: number | string = ':id') => `/leases/${id}/edit`,
  
  // Maintenance routes
  MAINTENANCE: '/maintenance',
  MAINTENANCE_DETAILS: (id: number | string = ':id') => `/maintenance/${id}`,
  MAINTENANCE_CREATE: '/maintenance/create',
  
  // Payment routes
  PAYMENTS: '/payments',
  PAYMENT_DETAILS: (id: number | string = ':id') => `/payments/${id}`,
  
  // Invoice routes
  INVOICES: '/invoices',
  INVOICE_DETAILS: (id: number | string = ':id') => `/invoices/${id}`,
  INVOICE_CREATE: '/invoices/create',
  
  // Report routes
  REPORTS: '/reports',
  
  // User routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Notification routes
  NOTIFICATIONS: '/notifications',
};