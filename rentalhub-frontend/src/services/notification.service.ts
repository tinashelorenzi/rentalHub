// src/services/notification.service.ts
import api from './api';
import { Notification } from '../types';

interface NotificationFilters {
  is_read?: boolean;
}

export const NotificationService = {
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/notifications/', { params: filters });
    return data;
  },
  
  async markAsRead(id: number): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(`/notifications/${id}/read/`);
    return data;
  },
  
  async markAllAsRead(): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>('/notifications/read-all/');
    return data;
  }
};