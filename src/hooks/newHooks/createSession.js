import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useCreateSession = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, sessionData) => {
    try {
      const response = await _execute(`courses/${courseId}/sessions`, 'POST', sessionData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};