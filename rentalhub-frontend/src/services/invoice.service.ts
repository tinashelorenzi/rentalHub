// src/services/invoice.service.ts
import api from './api';
import { Invoice } from '../types';

interface InvoiceFilters {
  status?: string;
  property_id?: number;
  tenant_id?: number;
}

export const InvoiceService = {
  async getInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
    const { data } = await api.get<Invoice[]>('/invoices/', { params: filters });
    return data;
  },
  
  async getInvoice(id: number): Promise<Invoice> {
    const { data } = await api.get<Invoice>(`/invoices/${id}/`);
    return data;
  },
  
  async createInvoice(invoiceData: {
    tenant_id: number;
    property_id: number;
    lease_id: number;
    amount: number;
    description: string;
    due_date: string;
  }): Promise<Invoice> {
    const { data } = await api.post<Invoice>('/invoices/', invoiceData);
    return data;
  },
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.put<Invoice>(`/invoices/${id}/`, invoiceData);
    return data;
  }
};