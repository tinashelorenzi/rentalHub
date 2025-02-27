// src/hooks/useClickOutside.ts
import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  exceptionalRefs?: React.RefObject<HTMLElement>[]
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside the ref element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Check if the click was inside any of the exceptional refs
        const isInsideExceptionalRef = exceptionalRefs?.some(
          exceptionalRef => exceptionalRef.current && exceptionalRef.current.contains(event.target as Node)
        );

        if (!isInsideExceptionalRef) {
          handler();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, exceptionalRefs]);

  return ref as React.RefObject<T>;
}