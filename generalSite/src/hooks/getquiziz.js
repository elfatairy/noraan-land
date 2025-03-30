import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGetQuizzes = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId) => {
    try {
      const response = await _execute(`courses/${courseId}/quizzes`, 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};