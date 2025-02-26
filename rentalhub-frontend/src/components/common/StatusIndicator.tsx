// src/components/common/StatusIndicator.tsx
import React from 'react';
import Badge from './Badge';

// Define status types for different entities
export type PropertyStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

interface StatusIndicatorProps {
  type: 'property' | 'maintenance' | 'invoice' | 'priority';
  status: PropertyStatus | MaintenanceStatus | InvoiceStatus | Priority;
  size?: 'sm' | 'md';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  size = 'md',
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'property':
        switch (status) {
          case 'AVAILABLE':
            return { label: 'Available', variant: 'success' as const };
          case 'RENTED':
            return { label: 'Rented', variant: 'primary' as const };
          case 'MAINTENANCE':
            return { label: 'Maintenance', variant: 'warning' as const };
          default:
            return { label: status, variant: 'default' as const };
        }
      
      case 'maintenance':
        switch (status) {
          case 'PENDING':
            return { label: 'Pending', variant: 'warning' as const };
          case 'IN_PROGRESS':
            return { label: 'In Progress', variant: 'info' as const };
          case 'RESOLVED':
            return { label: 'Resolved', variant: 'success' as const };
          case 'CANCELLED':
            return { label: 'Cancelled', variant: 'danger' as const };
          default:
            return { label: status, variant: 'default' as const };
        }
      
      case 'invoice':
        switch (status) {
          case 'PENDING':
            return { label: 'Pending', variant: 'warning' as const };
          case 'PAID':
            return { label: 'Paid', variant: 'success' as const };
          case 'OVERDUE':
            return { label: 'Overdue', variant: 'danger' as const };
          case 'CANCELLED':
            return { label: 'Cancelled', variant: 'default' as const };
          default:
            return { label: status, variant: 'default' as const };
        }
      
      case 'priority':
        switch (status) {
          case 'LOW':
            return { label: 'Low', variant: 'info' as const };
          case 'MEDIUM':
            return { label: 'Medium', variant: 'warning' as const };
          case 'HIGH':
            return { label: 'High', variant: 'danger' as const };
          case 'EMERGENCY':
            return { label: 'Emergency', variant: 'danger' as const };
          default:
            return { label: status, variant: 'default' as const };
        }
      
      default:
        return { label: status, variant: 'default' as const };
    }
  };
  
  const { label, variant } = getStatusConfig();
  
  return <Badge variant={variant} size={size}>{label}</Badge>;
};

export default StatusIndicator;