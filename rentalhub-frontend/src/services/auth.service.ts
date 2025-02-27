// src/services/auth.service.ts
import api from './api';
import { User } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
}

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // API expects FormData for login
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const { data } = await api.post<LoginResponse>('/token', formData);
    
    // Store token in localStorage
    localStorage.setItem('token', data.access_token);
    
    return data;
  },
  
  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/users/me/');
    return data;
  },
  
  logout(): void {
    localStorage.removeItem('token');
  },
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};