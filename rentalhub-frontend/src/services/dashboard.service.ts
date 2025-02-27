// src/services/dashboard.service.ts
import api from './api';

export const DashboardService = {
  async getLandlordSummary() {
    const { data } = await api.get('/dashboard/landlord-summary/');
    return data;
  },
  
  async getTenantSummary() {
    const { data } = await api.get('/dashboard/tenant-summary/');
    return data;
  },
  
  async getPropertyManagerSummary() {
    const { data } = await api.get('/dashboard/property-manager-summary/');
    return data;
  }
};