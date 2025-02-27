// src/hooks/usePagination.ts
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../config/constants';

interface PaginationState<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

interface PaginationHook<T> extends PaginationState<T> {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; count: number }>,
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE
): PaginationHook<T> {
  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    totalPages: 0,
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    isLoading: false,
    isError: false,
    error: null,
  });

  const fetchData = useCallback(
    async (page: number, pageSize: number) => {
      setState(prevState => ({ ...prevState, isLoading: true }));
      try {
        const { data, count } = await fetchFunction(page, pageSize);
        setState({
          data,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          pageSize,
          isLoading: false,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
      }
    },
    [fetchFunction]
  );

  // Fetch initial data
  useEffect(() => {
    fetchData(initialPage, initialPageSize);
  }, [fetchData, initialPage, initialPageSize]);

  const setPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= state.totalPages) {
        fetchData(page, state.pageSize);
      }
    },
    [fetchData, state.totalPages, state.pageSize]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      fetchData(1, pageSize); // Reset to page 1 when changing page size
    },
    [fetchData]
  );

  const refresh = useCallback(
    () => fetchData(state.currentPage, state.pageSize),
    [fetchData, state.currentPage, state.pageSize]
  );

  const nextPage = useCallback(
    () => setPage(state.currentPage + 1),
    [setPage, state.currentPage]
  );

  const prevPage = useCallback(
    () => setPage(state.currentPage - 1),
    [setPage, state.currentPage]
  );

  return {
    ...state,
    setPage,
    setPageSize,
    refresh,
    nextPage,
    prevPage,
  };
}