// src/components/leases/LeaseInfoCard.tsx
import React from 'react';
import { format, differenceInDays } from 'date-fns';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Lease } from '../../types';

interface LeaseInfoCardProps {
  lease: Lease;
  onViewDetails?: () => void;
}

const LeaseInfoCard: React.FC<LeaseInfoCardProps> = ({ lease, onViewDetails }) => {
  const startDate = new Date(lease.start_date);
  const endDate = new Date(lease.end_date);
  const today = new Date();
  const daysRemaining = differenceInDays(endDate, today);
  
  const getExpirationBadge = () => {
    if (!lease.is_active) {
      return <Badge variant="danger">Inactive</Badge>;
    }
    
    if (daysRemaining < 0) {
      return <Badge variant="danger">Expired</Badge>;
    }
    
    if (daysRemaining <= 30) {
      return <Badge variant="warning">Expires Soon</Badge>;
    }
    
    return <Badge variant="success">Active</Badge>;
  };
  
  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm text-gray-500">Lease #{lease.id}</div>
          <h3 className="text-lg font-semibold">{lease.property_name}</h3>
        </div>
        {getExpirationBadge()}
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600">Tenant:</div>
        <div className="font-medium">{lease.tenant_name}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Start Date:</div>
          <div className="font-medium">{format(startDate, 'MMM d, yyyy')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">End Date:</div>
          <div className="font-medium">{format(endDate, 'MMM d, yyyy')}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Rent Amount:</div>
          <div className="font-medium text-primary">${lease.rent_amount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Deposit:</div>
          <div className="font-medium">${lease.deposit_amount.toLocaleString()}</div>
        </div>
      </div>
      
      {lease.is_active && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">Lease Status:</div>
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  daysRemaining < 0 ? 'bg-red-600' : 
                  daysRemaining < 30 ? 'bg-yellow-500' : 
                  'bg-green-600'
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, 100 - (daysRemaining / (differenceInDays(endDate, startDate)) * 100)))}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Start</span>
              <span>
                {daysRemaining < 0 
                  ? 'Expired' 
                  : daysRemaining === 0 
                    ? 'Expires today' 
                    : `${daysRemaining} days remaining`
                }
              </span>
              <span>End</span>
            </div>
          </div>
        </div>
      )}
      
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-2 text-center w-full py-2 text-sm text-primary hover:text-primary-dark font-medium border border-primary rounded-md hover:bg-primary/5 transition-colors"
        >
          View Details
        </button>
      )}
    </Card>
  );
};

export default LeaseInfoCard;