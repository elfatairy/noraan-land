import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useApplyForCourse = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (payload) => {
    try {
      return await _execute('students/actions/applyForCourse', 'POST', payload);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};