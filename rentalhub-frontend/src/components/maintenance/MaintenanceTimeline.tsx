// src/components/maintenance/MaintenanceTimeline.tsx
import React from 'react';
import { format } from 'date-fns';

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  user: string;
  type: 'status_change' | 'comment' | 'assignment' | 'creation';
}

interface MaintenanceTimelineProps {
  items: TimelineItem[];
}

const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ items }) => {
  const getTypeIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'status_change':
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'assignment':
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        );
      case 'creation':
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index !== items.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              )}
              <div className="relative flex space-x-3">
                <div>{getTypeIcon(item.type)}</div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <div>{format(new Date(item.date), 'MMM d, yyyy')}</div>
                    <div>{format(new Date(item.date), 'h:mm a')}</div>
                    <div className="text-xs">{item.user}</div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceTimeline;