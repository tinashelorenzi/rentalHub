// src/services/property.service.ts
import api from './api';
import { Property } from '../types';

interface PropertyFilters {
  status?: string;
  category?: string;
  city?: string;
  min_bedrooms?: number;
  max_rent?: number;
}

export const PropertyService = {
  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    const { data } = await api.get<Property[]>('/properties/', { params: filters });
    return data;
  },
  
  async getProperty(id: number): Promise<Property> {
    const { data } = await api.get<Property>(`/properties/${id}/`);
    return data;
  },
  
  async createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'images'>): Promise<Property> {
    const { data } = await api.post<Property>('/properties/', propertyData);
    return data;
  },
  
  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property> {
    const { data } = await api.put<Property>(`/properties/${id}/`, propertyData);
    return data;
  },
  
  async uploadPropertyImage(propertyId: number, imageFile: File, isMain: boolean = false, caption: string = ''): Promise<{ image_id: number }> {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('is_primary', isMain.toString());
    formData.append('caption', caption);
    
    const { data } = await api.post<{ message: string, image_id: number }>(`/properties/${propertyId}/images/`, formData);
    return data;
  },
  
  async uploadPropertyDocument(propertyId: number, documentFile: File, title: string, description: string = ''): Promise<{ document_id: number }> {
    const formData = new FormData();
    formData.append('file', documentFile);
    formData.append('title', title);
    formData.append('description', description);
    
    const { data } = await api.post<{ message: string, document_id: number }>(`/properties/${propertyId}/documents/`, formData);
    return data;
  },
  
  async getPropertyStatistics(propertyId: number): Promise<any> {
    const { data } = await api.get(`/properties/${propertyId}/statistics/`);
    return data;
  }
};