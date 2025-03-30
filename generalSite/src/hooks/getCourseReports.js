import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGetCourseReports = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, studentId) => {
    try {
      const response = await _execute(`students/${studentId}/courses/${courseId}/reports`, 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};