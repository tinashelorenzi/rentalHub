// src/services/payment.service.ts
import api from './api';
import { Payment } from '../types';

interface PaymentFilters {
  invoice_id?: number;
  property_id?: number;
  tenant_id?: number;
}

export const PaymentService = {
  async getPayments(filters: PaymentFilters = {}): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>('/payments/', { params: filters });
    return data;
  },
  
  async getPayment(id: number): Promise<Payment> {
    const { data } = await api.get<Payment>(`/payments/${id}/`);
    return data;
  },
  
  async createPayment(paymentData: {
    invoice_id: number;
    amount: number;
    payment_method: string;
    transaction_id?: string;
    notes?: string;
  }): Promise<Payment> {
    const { data } = await api.post<Payment>('/payments/', paymentData);
    return data;
  }
};