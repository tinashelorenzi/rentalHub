// src/hooks/useToast.ts
import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastHook {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

export function useToast(maxToasts: number = 5): ToastHook {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = generateId();
      const newToast: Toast = { id, type, message, duration };
      
      // Add new toast to the array, remove oldest if over maxToasts
      setToasts(prev => {
        const updated = [...prev, newToast];
        return updated.slice(Math.max(0, updated.length - maxToasts));
      });
      
      // Auto-hide toast after duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [maxToasts]
  );

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, hideToast };
}