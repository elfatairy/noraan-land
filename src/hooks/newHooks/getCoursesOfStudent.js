import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useGetCoursesOfStudent = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (studentId) => {
    try {
      const response = await _execute(`students/${studentId}/courses`, 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};