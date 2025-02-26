// src/components/layout/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { User, Notification } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  notifications: Notification[];
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  notifications,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral">
      <Header 
        user={user} 
        notifications={notifications} 
        onLogout={onLogout} 
      />
      
      <div className="flex">
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;