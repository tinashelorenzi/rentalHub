// src/hooks/useApi.ts
import { useState, useCallback } from 'react';

type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: Error | null;
}

interface ApiHook<T, P extends any[]> {
  data: T | null;
  status: ApiStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  execute: (...params: P) => Promise<T>;
  reset: () => void;
}

export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>
): ApiHook<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const execute = useCallback(
    async (...params: P) => {
      setState({ data: null, status: 'loading', error: null });
      try {
        const data = await apiFunction(...params);
        setState({ data, status: 'success', error: null });
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, status: 'error', error: errorObj });
        throw errorObj;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, status: 'idle', error: null });
  }, []);

  return {
    data: state.data,
    status: state.status,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    error: state.error,
    execute,
    reset,
  };
}