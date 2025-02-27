// src/services/lease.service.ts
import api from './api';
import { Lease } from '../types';

interface LeaseFilters {
  is_active?: boolean;
  property_id?: number;
}

export const LeaseService = {
  async getLeases(filters: LeaseFilters = {}): Promise<Lease[]> {
    const { data } = await api.get<Lease[]>('/leases/', { params: filters });
    return data;
  },
  
  async getLease(id: number): Promise<Lease> {
    const { data } = await api.get<Lease>(`/leases/${id}/`);
    return data;
  },
  
  async createLease(leaseData: Omit<Lease, 'id' | 'created_at' | 'updated_at' | 'property_name' | 'tenant_name'>): Promise<Lease> {
    const { data } = await api.post<Lease>('/leases/', leaseData);
    return data;
  },
  
  async updateLease(id: number, leaseData: Partial<Lease>): Promise<Lease> {
    const { data } = await api.put<Lease>(`/leases/${id}/`, leaseData);
    return data;
  },
  
  async uploadLeaseDocument(leaseId: number, documentFile: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', documentFile);
    
    const { data } = await api.post<{ message: string }>(`/leases/${leaseId}/document/`, formData);
    return data;
  }
};