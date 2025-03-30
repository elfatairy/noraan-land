import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useConvertToPrivate = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (studentId, courseId) => {
    try {
      const response = await _execute(`students/${studentId}/courses/${courseId}/convertToPrivate`, 'PATCH');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};