import { useState, useEffect, useCallback } from 'react';
import { QueryClient, useQuery, useMutation, useQueryClient, QueryObserverOptions, UseMutationOptions, Query, QueryKey, RetryDelayFunction } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define API error types
export interface ApiError extends Error {
  name: string;
  message: string;
  status?: number;
  data?: any;
  stack?: string;
}

// Define API request options
type ApiRequestOptions<T = any> = {
  retry?: number | boolean | ((failureCount: number, error: Error) => boolean);
  retryDelay?: (attemptIndex: number) => number | Promise<number>;
  staleTime?: number | ((query: Query<unknown, Error, unknown, QueryKey>) => number);
  refetchOnWindowFocus?: boolean | "always" | ((query: Query<unknown, Error, unknown, QueryKey>) => boolean | "always");
  refetchOnReconnect?: boolean | "always" | ((query: Query<unknown, Error, unknown, QueryKey>) => boolean | "always");
  gcTime?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  queryOptions?: Partial<QueryObserverOptions<T, ApiError>>;
  mutationOptions?: Partial<UseMutationOptions<T, ApiError>>;
};

// Default query options
const DEFAULT_QUERY_OPTIONS: Partial<QueryObserverOptions> = {
  retry: 2,
  retryDelay: (attemptIndex: number, error: Error): number => attemptIndex * 1000,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  gcTime: 5 * 60 * 1000,
} as const;

const DEFAULT_MUTATION_OPTIONS: Partial<UseMutationOptions> = {
  retry: 2,
  retryDelay: (attemptIndex: number, error: Error): number => attemptIndex * 1000,
  gcTime: 5 * 60 * 1000,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex: number, error: Error): number => attemptIndex * 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      gcTime: 5 * 60 * 1000,
    } as const,
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex: number, error: Error): number => attemptIndex * 1000,
      gcTime: 5 * 60 * 1000,
    } as const,
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
    mutation: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ): Promise<T> => {
    try {
      return await mutation();
    } catch (error) {
      if (error instanceof Error) {
        throw error as ApiError;
      } else {
        throw new Error('Unknown error');
      }
    }
  }, []);

  const useQuery = <T, E extends ApiError = ApiError>(
    queryKey: string[],
    fetchFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ) => {
    const retryDelay: RetryDelayFunction = (attemptIndex: number, error: Error): number => {
      const delayFn = typeof options?.retryDelay === 'function' ? options.retryDelay : DEFAULT_QUERY_OPTIONS.retryDelay;
      return typeof delayFn === 'function' ? delayFn(attemptIndex, error) : DEFAULT_QUERY_OPTIONS.retryDelay(attemptIndex, error);
    };

    return useQuery<T, E>(
      queryKey,
      () => queryFn(queryKey, fetchFn, options),
      {
        retry: typeof options?.retry === 'number' ? options.retry : DEFAULT_QUERY_OPTIONS.retry,
        retryDelay: retryDelay,
        staleTime: typeof options?.staleTime === 'number' ? options.staleTime : DEFAULT_QUERY_OPTIONS.staleTime,
        refetchOnWindowFocus: typeof options?.refetchOnWindowFocus === 'boolean' ? options.refetchOnWindowFocus : DEFAULT_QUERY_OPTIONS.refetchOnWindowFocus,
        refetchOnReconnect: typeof options?.refetchOnReconnect === 'boolean' ? options.refetchOnReconnect : DEFAULT_QUERY_OPTIONS.refetchOnReconnect,
        gcTime: typeof options?.gcTime === 'number' ? options.gcTime : DEFAULT_QUERY_OPTIONS.gcTime,
        enabled: options?.enabled ?? true,
        onSuccess: options?.onSuccess,
        onError: (error: E) => {
          handleApiError(error);
          options?.onError?.(error);
        },
      }
    );
  };

  const useMutation = <T, E extends ApiError = ApiError>(
    mutationFn: () => Promise<T>,
    options?: ApiRequestOptions<T>
  ) => {
    const retryDelay: RetryDelayFunction = (attemptIndex: number, error: Error): number => {
      const delayFn = typeof options?.retryDelay === 'function' ? options.retryDelay : DEFAULT_MUTATION_OPTIONS.retryDelay;
      return typeof delayFn === 'function' ? delayFn(attemptIndex, error) : DEFAULT_MUTATION_OPTIONS.retryDelay(attemptIndex, error);
    };

    return useMutation<T, E>(
      mutationFn,
      {
        retry: typeof options?.retry === 'number' ? options.retry : DEFAULT_MUTATION_OPTIONS.retry,
        retryDelay: retryDelay,
        gcTime: typeof options?.gcTime === 'number' ? options.gcTime : DEFAULT_MUTATION_OPTIONS.gcTime,
        onSuccess: options?.onSuccess,
        onError: (error: E) => {
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
