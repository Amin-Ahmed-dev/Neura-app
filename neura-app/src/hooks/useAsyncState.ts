/**
 * useAsyncState Hook
 * 
 * Eliminates duplicate loading/error state patterns across the app.
 * Provides consistent async operation handling with callbacks.
 */

import { useState, useCallback } from 'react';

export interface UseAsyncStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T | null;
  errorMessage?: string;
}

export interface UseAsyncStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing async operations with loading/error states
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsyncState(
 *   async () => await apiClient.get('/data'),
 *   {
 *     onSuccess: (data) => console.log('Success!', data),
 *     onError: (err) => console.error('Failed:', err),
 *   }
 * );
 * 
 * // Trigger the async operation
 * useEffect(() => { execute(); }, []);
 * ```
 */
export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  options?: UseAsyncStateOptions<T>
): UseAsyncStateReturn<T> {
  const [data, setData] = useState<T | null>(options?.initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = options?.errorMessage 
        ?? (err instanceof Error ? err.message : 'حصل خطأ');
      setError(message);
      options?.onError?.(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setData(options?.initialData ?? null);
    setLoading(false);
    setError(null);
  }, [options?.initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Variant for operations that don't return data (e.g., delete, update)
 */
export function useAsyncAction(
  asyncFn: () => Promise<void>,
  options?: Omit<UseAsyncStateOptions<void>, 'initialData'>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await asyncFn();
      options?.onSuccess?.(undefined);
      return true;
    } catch (err) {
      const message = options?.errorMessage 
        ?? (err instanceof Error ? err.message : 'حصل خطأ');
      setError(message);
      options?.onError?.(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
    setError,
  };
}
