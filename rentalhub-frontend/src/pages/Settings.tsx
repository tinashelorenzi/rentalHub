// src/pages/Settings.tsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Checkbox from '../components/forms/Checkbox';
import Select from '../components/forms/Select';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Sample notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'payment_due',
      label: 'Payment Due Reminders',
      description: 'Get notified before rent or invoice payments are due',
      enabled: true,
    },
    {
      id: 'payment_received',
      label: 'Payment Received',
      description: 'Get notified when a payment is received',
      enabled: true,
    },
    {
      id: 'maintenance_update',
      label: 'Maintenance Updates',
      description: 'Get notified about changes to maintenance requests',
      enabled: true,
    },
    {
      id: 'lease_expiry',
      label: 'Lease Expiration',
      description: 'Get notified before leases expire',
      enabled: true,
    },
    {
      id: 'new_messages',
      label: 'New Messages',
      description: 'Get notified when you receive new messages',
      enabled: false,
    },
  ]);
  
  const toggleNotificationSetting = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };
  
  // Simulated save settings function
  const saveSettings = () => {
    // In a real application, we would call an API to save the settings
    console.log('Saving settings:', {
      theme,
      notificationSettings,
    });
    
    // Show a success message or toast
    alert('Settings saved successfully!');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your application settings"
        actions={
          <Button onClick={saveSettings}>
            Save Settings
          </Button>
        }
      />
      
      {/* App Appearance */}
      <Card title="Appearance">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Theme</h3>
            <div className="flex items-center space-x-4">
              <div 
                className={`p-4 border rounded-md cursor-pointer ${
                  theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
                onClick={() => theme === 'dark' && toggleTheme()}
              >
                <div className="bg-white p-4 rounded-md shadow-sm mb-2">
                  <div className="h-2 w-16 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="text-center text-sm font-medium">
                  Light Mode
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-md cursor-pointer ${
                  theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
                onClick={() => theme === 'light' && toggleTheme()}
              >
                <div className="bg-gray-800 p-4 rounded-md shadow-sm mb-2">
                  <div className="h-2 w-16 bg-gray-600 rounded mb-2"></div>
                  <div className="h-2 w-24 bg-gray-700 rounded"></div>
                </div>
                <div className="text-center text-sm font-medium">
                  Dark Mode
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Language</h3>
            <div className="max-w-xs">
              <Select
                id="language"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                ]}
                value="en"
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Notification Settings */}
      <Card title="Notification Settings">
        <div className="space-y-6">
          <div className="space-y-4">
            {notificationSettings.map(setting => (
              <div key={setting.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id={setting.id}
                    label=""
                    checked={setting.enabled}
                    onChange={() => toggleNotificationSetting(setting.id)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={setting.id} className="font-medium text-gray-700">
                    {setting.label}
                  </label>
                  <p className="text-gray-500">{setting.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Email Notifications</h3>
            <div className="max-w-xs">
              <Select
                id="email_frequency"
                label="Notification Frequency"
                options={[
                  { value: 'instant', label: 'Send Immediately' },
                  { value: 'daily', label: 'Daily Digest' },
                  { value: 'weekly', label: 'Weekly Digest' },
                  { value: 'none', label: 'Don\'t Send Emails' },
                ]}
                value="instant"
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Account Settings */}
      <Card title="Account Settings">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;