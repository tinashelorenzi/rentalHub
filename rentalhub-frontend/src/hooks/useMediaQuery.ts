// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Update the state with the current match value
      setMatches(media.matches);
      
      // Create a listener function to update state on change
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      // Add the listener to the media query
      media.addEventListener('change', listener);
      
      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    return undefined;
  }, [query]);

  return matches;
}