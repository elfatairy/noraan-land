import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useAssignHours = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (studentId, courseId, hours) => {
    try {
      const response = await _execute(`students/${studentId}/courses/${courseId}/hours`, 'PUT', { hours });
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};