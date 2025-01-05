import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useGetCourseUsers = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, type = 'individual') => {
    try {
      const endpoint = type === 'new' ? 
        `admin/actions/newCourseUsers/${courseId}` :
        `admin/actions/course${type.charAt(0).toUpperCase() + type.slice(1)}Users/${courseId}`;
      
      const response = await _execute(endpoint, 'GET');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};
