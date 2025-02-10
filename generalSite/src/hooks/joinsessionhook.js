import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useJoinSession = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, sessionId) => {
    try {
      const response = await _execute(`users/actions/joinSession/${courseId}/${sessionId}`, 'POST');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};