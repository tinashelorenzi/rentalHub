// src/components/common/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = '',
  hoverEffect = false,
}) => {
  const cardVariants = {
    hover: { y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      whileHover={hoverEffect ? 'hover' : undefined}
      variants={cardVariants}
    >
      {(title || action) && (
        <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-neutral-dark">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

export default Card;