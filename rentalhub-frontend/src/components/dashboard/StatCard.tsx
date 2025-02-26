// src/components/dashboard/StatCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    neutral: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="h-full">
      <div className="flex items-start">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {change && (
              <p className={`ml-2 text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;