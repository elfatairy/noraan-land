import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useUpdateCourse = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (id, courseData) => {
    try {
      const response = await _execute(`courses/${id}`, 'PATCH', courseData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};