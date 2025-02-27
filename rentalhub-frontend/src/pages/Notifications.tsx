// src/pages/Notifications.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { formatRelativeTime } from '../utils/formatters';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notifications: React.FC = () => {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notifications" 
        subtitle="View your recent notifications"
        actions={
          unreadCount > 0 ? (
            <Button onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          ) : null
        }
      />
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You don't have any notifications."
        />
      ) : (
        <Card>
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{notification.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(notification.created_at)}</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-primary hover:text-primary-dark"
                      >
                        Mark as Read
                      </button>
                    )}
                    
                    {notification.content_type && notification.object_id && getNotificationLink(notification)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper function to determine notification links
const getNotificationLink = (notification: any) => {
  let route = '';
  
  switch (notification.content_type) {
    case 'invoice':
      route = `/invoices/${notification.object_id}`;
      break;
    case 'payment':
      route = `/payments/${notification.object_id}`;
      break;
    case 'maintenance':
      route = `/maintenance/${notification.object_id}`;
      break;
    case 'lease':
      route = `/leases/${notification.object_id}`;
      break;
    default:
      return null;
  }
  
  return (
    <Link 
      to={route}
      className="text-xs text-primary hover:text-primary-dark"
    >
      View Details
    </Link>
  );
};

export default Notifications;