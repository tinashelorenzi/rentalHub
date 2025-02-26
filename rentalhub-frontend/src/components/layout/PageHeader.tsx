// src/components/layout/PageHeader.tsx
import React from 'react';
import Button from '../common/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;