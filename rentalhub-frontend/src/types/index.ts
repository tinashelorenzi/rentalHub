// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'LANDLORD' | 'PROPERTY_MANAGER' | 'TENANT';
  phone_number?: string;
  profile_image?: string;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  monthly_rent: number;
  deposit_amount: number;
  description?: string;
  amenities?: string;
  owner_id: number;
  property_manager_id?: number;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
}

export interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  property_name: string;
  tenant_name: string;
}

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  property_name: string;
  tenant_id: number;
  tenant_name: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  assigned_to_id?: number;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  property_id: number;
  lease_id: number;
  amount: number;
  description: string;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  tenant_name: string;
  property_name: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH' | 'CHECK';
  transaction_id?: string;
  notes?: string;
  created_at: string;
  invoice_amount: number;
  tenant_id: number;
  tenant_name: string;
  property_id: number;
  property_name: string;
}

export interface Notification {
  id: number;
  type: 'PAYMENT_DUE' | 'PAYMENT_RECEIVED' | 'MAINTENANCE_UPDATE' | 'LEASE_UPDATE' | 'GENERAL';
  title: string;
  message: string;
  is_read: boolean;
  content_type?: string;
  object_id?: number;
  created_at: string;
}