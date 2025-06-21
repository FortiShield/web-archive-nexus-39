import { useState, useEffect, useCallback } from 'react';
import { QueryClient, useQuery, useMutation, useQueryClient, QueryObserverOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define API error types
export interface ApiError extends Error {
  name: string;
  message: string;
  status?: number;
  data?: any;
  stack?: string;
}

// Define API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Define API request options
type ApiRequestOptions<T = any> = {
  retry?: number;
  retryDelay?: (attemptIndex: number) => number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  gcTime?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  queryOptions?: Partial<QueryObserverOptions<T, ApiError>>;
  mutationOptions?: Partial<UseMutationOptions<T, ApiError>>;
};

// Define API error types
export interface ApiError extends Error {
  name: string;
  message: string;
  status?: number;
  data?: any;
  stack?: string;
}

// Define API response types
  retry: 2,
  retryDelay: (attemptIndex: number) => attemptIndex * 1000,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  gcTime: 5 * 60 * 1000,
};

const DEFAULT_MUTATION_OPTIONS: Partial<UseMutationOptions> = {
  retry: 2,
  retryDelay: (attemptIndex: number) => attemptIndex * 1000,
  gcTime: 5 * 60 * 1000,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex: number) => attemptIndex * 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex: number) => attemptIndex * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

export const useApi = () => {
  const queryClient = useQueryClient();
  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);
    toast.error(error?.message || 'An error occurred');
  }, []);

  const queryFn = useCallback(async <T>(
    queryKey: string[],
    fetchFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ): Promise<T> => {
    try {
      return await fetchFn();
    } catch (error) {
      throw error as ApiError;
    }
  }, []);

  const mutationFn = useCallback(async <T>(
    mutationFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ) => {
    try {
      const data = await mutationFn();
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const useQuery = <T>(
    queryKey: string[],
    fetchFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ) => {
    return useQuery<T>(
      queryKey,
      () => queryFn(queryKey, fetchFn, options),
      {
        retry: options?.retry ?? 2,
        retryDelay: options?.retryDelay ?? ((attemptIndex) => attemptIndex * 1000),
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
        refetchOnReconnect: options?.refetchOnReconnect ?? true,
        gcTime: options?.gcTime ?? 5 * 60 * 1000,
        enabled: options?.enabled ?? true,
        onSuccess: options?.onSuccess,
        onError: (error: ApiError) => {
          handleApiError(error);
          options?.onError?.(error);
        },
      }
    );
  };

  const useMutation = <T>(
    mutationFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ) => {
    return useMutation<T>(
      mutationFn,
      {
        retry: options?.retry ?? 2,
        retryDelay: options?.retryDelay ?? ((attemptIndex) => attemptIndex * 1000),
        gcTime: options?.gcTime ?? 5 * 60 * 1000,
        onSuccess: options?.onSuccess,
        onError: (error: ApiError) => {
          handleApiError(error);
          options?.onError?.(error);
        },
      }
    );
  };

  const invalidateQueries = useCallback(
    (queryKeys: string[]) => {
      queryClient.invalidateQueries({ queryKey: queryKeys });
    },
    [queryClient]
  );

  return {
    useQuery,
    useMutation,
    invalidateQueries,
  };
};
