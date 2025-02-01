import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGetBusyDates = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async () => {
    try {
      const response = await _execute('calendar/busyDates', 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};