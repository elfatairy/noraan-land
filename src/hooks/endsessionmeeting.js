import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useEndSession = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (sessionType, sessionId, sessionData) => {
    try {
      const response = await _execute(`admin/actions/endSession/${sessionType}/${sessionId}`, 'POST', sessionData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};