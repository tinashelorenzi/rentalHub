// src/components/dashboard/MaintenanceRequestCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusIndicator from '../common/StatusIndicator';
import Avatar from '../common/Avatar';
import { format } from 'date-fns';
import { MaintenanceRequest } from '../../types';

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
}

const MaintenanceRequestCard: React.FC<MaintenanceRequestCardProps> = ({ request }) => {
  const createdDate = new Date(request.created_at);
  
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
          <div className="text-sm text-gray-500">
            Property: {request.property_name || 'Not available'}
          </div>
        </div>
        <div className="flex space-x-2">
          <StatusIndicator type="priority" status={request.priority} />
          <StatusIndicator type="maintenance" status={request.status} />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-3">{request.description}</p>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <Avatar size="xs" name={request.tenant_name} />
          <span className="ml-2 text-sm text-gray-600">{request.tenant_name}</span>
        </div>
        <div className="text-sm text-gray-500">
          {format(createdDate, 'MMM d, yyyy')}
        </div>
      </div>
      
      <Link 
        to={`/maintenance/${request.id}`}
        className="block mt-4 text-center text-sm text-primary hover:text-primary-dark font-medium"
      >
        View Details →
      </Link>
    </Card>
  );
};

export default MaintenanceRequestCard;