// src/components/common/NotificationBadge.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
}) => {
  if (count === 0) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full"
      >
        {count > maxCount ? `${maxCount}+` : count}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationBadge;