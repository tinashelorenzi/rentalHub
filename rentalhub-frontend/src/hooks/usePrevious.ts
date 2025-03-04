// src/hooks/usePrevious.ts
import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined as unknown as T);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}