import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGetCourses = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async () => {
    try {
      const response = await _execute('courses', 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};