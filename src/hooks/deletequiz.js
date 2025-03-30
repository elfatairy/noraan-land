import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useDeleteQuiz = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, quizId) => {
    try {
      const response = await _execute(`courses/${courseId}/quizzes/${quizId}`, 'DELETE');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};