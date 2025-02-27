// src/services/user.service.ts
import api from './api';
import { User } from '../types';

interface UserSearchFilters {
  role?: string;
  query?: string;
}

interface UserSearchResult {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: string;
  profile_image: string;
}

export const UserService = {
  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data } = await api.put<User>('/users/me/', userData);
    return data;
  },
  
  async uploadProfileImage(imageFile: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const { data } = await api.post<{ message: string }>('/users/me/profile-image/', formData);
    return data;
  },
  
  async searchUsers(filters: UserSearchFilters = {}): Promise<UserSearchResult[]> {
    const { data } = await api.get<UserSearchResult[]>('/users/search/', { params: filters });
    return data;
  }
};