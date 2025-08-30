import { useState, useCallback, useMemo } from 'react';

interface PaginationConfig {
  initialPage?: number;
  pageSize?: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

interface PaginationResult<T> {
  // State
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  
  // Data
  paginatedData: T[];
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  
  // Helpers
  hasNext: boolean;
  hasPrevious: boolean;
  isEmpty: boolean;
}

export const useAdminPagination = <T>(
  data: T[],
  config: PaginationConfig = {}
): PaginationResult<T> => {
  const { initialPage = 1, pageSize: initialPageSize = 10 } = config;

  const [state, setState] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize
  });

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / state.pageSize);
  }, [data.length, state.pageSize]);

  const startIndex = useMemo(() => {
    return (state.currentPage - 1) * state.pageSize;
  }, [state.currentPage, state.pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + state.pageSize, data.length);
  }, [startIndex, state.pageSize, data.length]);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setState(prev => ({ ...prev, currentPage: validPage }));
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    const validSize = Math.max(1, size);
    setState(prev => ({
      pageSize: validSize,
      currentPage: 1 // Reset to first page
    }));
  }, []);

  const goToFirst = useCallback(() => setPage(1), [setPage]);
  const goToLast = useCallback(() => setPage(totalPages), [setPage, totalPages]);
  const goToNext = useCallback(() => setPage(state.currentPage + 1), [setPage, state.currentPage]);
  const goToPrevious = useCallback(() => setPage(state.currentPage - 1), [setPage, state.currentPage]);

  const hasNext = state.currentPage < totalPages;
  const hasPrevious = state.currentPage > 1;
  const isEmpty = data.length === 0;

  return {
    // State
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    totalPages,
    startIndex,
    endIndex,
    
    // Data
    paginatedData,
    
    // Actions
    setPage,
    setPageSize,
    goToFirst,
    goToLast,
    goToNext,
    goToPrevious,
    
    // Helpers
    hasNext,
    hasPrevious,
    isEmpty
  };
};