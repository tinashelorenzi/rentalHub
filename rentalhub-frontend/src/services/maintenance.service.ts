// src/services/maintenance.service.ts
import api from './api';
import { MaintenanceRequest } from '../types';

interface MaintenanceFilters {
  status?: string;
  priority?: string;
  property_id?: number;
}

interface MaintenanceComment {
  id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

export const MaintenanceService = {
  async getMaintenanceRequests(filters: MaintenanceFilters = {}): Promise<MaintenanceRequest[]> {
    const { data } = await api.get<MaintenanceRequest[]>('/maintenance-requests/', { params: filters });
    return data;
  },
  
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest> {
    const { data } = await api.get<MaintenanceRequest>(`/maintenance-requests/${id}/`);
    return data;
  },
  
  async createMaintenanceRequest(requestData: {
    property_id: number;
    title: string;
    description: string;
    priority: string;
  }): Promise<MaintenanceRequest> {
    const { data } = await api.post<MaintenanceRequest>('/maintenance-requests/', requestData);
    return data;
  },
  
  async updateMaintenanceRequest(id: number, requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const { data } = await api.put<MaintenanceRequest>(`/maintenance-requests/${id}/`, requestData);
    return data;
  },
  
  async addComment(requestId: number, comment: string): Promise<{ comment_id: number, created_at: string }> {
    const { data } = await api.post<{ message: string, comment_id: number, created_at: string }>(
      `/maintenance-requests/${requestId}/comments/`,
      { comment }
    );
    return data;
  },
  
  async getComments(requestId: number): Promise<MaintenanceComment[]> {
    const { data } = await api.get<MaintenanceComment[]>(`/maintenance-requests/${requestId}/comments/`);
    return data;
  },
  
  async uploadImage(requestId: number, imageFile: File, caption: string = ''): Promise<{ image_id: number }> {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('caption', caption);
    
    const { data } = await api.post<{ message: string, image_id: number }>(
      `/maintenance-requests/${requestId}/images/`,
      formData
    );
    return data;
  }
};