// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import NotificationBadge from '../common/NotificationBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Notification } from '../../types';

interface HeaderProps {
  user: User | null;
  notifications: Notification[];
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg" // You'll need to add a logo file
                alt="RentalHub"
              />
              <span className="ml-2 text-xl font-bold text-primary">RentalHub</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              {/* Notifications dropdown */}
              <div className="relative">
                <button
                  className="p-1 rounded-full text-gray-500 hover:text-primary relative"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <NotificationBadge count={unreadCount} />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1 divide-y divide-gray-100 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div className="px-4 py-2 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              className="text-xs text-primary hover:text-primary-dark"
                              onClick={() => {/* Add mark all as read function */}}
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                            >
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                        
                        <div className="px-4 py-2 text-center">
                          <Link 
                            to="/notifications" 
                            className="text-sm text-primary hover:text-primary-dark"
                            onClick={() => setShowNotifications(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                >
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user.first_name} {user.last_name}
                  </span>
                  <Avatar 
                    src={user.profile_image} 
                    name={`${user.first_name} ${user.last_name}`} 
                    size="sm" 
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-gray-500">{user.email}</div>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Settings
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;