import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useCancelSession = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, sessionId) => {
    try {
      const response = await _execute(
        `courses/${courseId}/sessions/${sessionId}/cancel`,
        'DELETE'
      );
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};