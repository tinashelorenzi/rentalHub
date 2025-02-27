// src/utils/helpers.ts
// Sleep utility for async operations
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Group array of objects by key
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const keyValue = String(item[key]);
    (result[keyValue] = result[keyValue] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Check if an object is a subset of another object
export const isSubset = (subset: Record<string, any>, superset: Record<string, any>): boolean => {
  return Object.keys(subset).every(key => {
    if (typeof subset[key] === 'object' && subset[key] !== null && typeof superset[key] === 'object' && superset[key] !== null) {
      return isSubset(subset[key], superset[key]);
    }
    return subset[key] === superset[key];
  });
};

// Extract query parameters from URL
export const getQueryParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// Generate a random ID (useful for temporary IDs before API response)
export const generateTempId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Download a file (blob) with a given filename
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};