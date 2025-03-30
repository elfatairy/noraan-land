import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useStartMeeting = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (sessionId) => {
    try {
      const response = await _execute(`admin/actions/startMeeting/${sessionId}`, 'POST');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};