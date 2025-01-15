import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useCreateGroupSession = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (sessionData) => {
    try {
      const response = await _execute('sessions/group', 'POST', {
        ...sessionData,
        date: new Date(sessionData.date).toISOString()
      });
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};