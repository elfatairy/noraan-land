import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useUpdateSessionDate = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, sessionId, data) => {
    try {
      const response = await _execute(
        `courses/${courseId}/sessions/${sessionId}/updateDate`,
        'PATCH',
        data
      );
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};