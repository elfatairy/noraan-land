import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGoogleLogin = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (data) => {
    try {
      const response = await _execute(`students/auth/google-login`, 'POST', data);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};