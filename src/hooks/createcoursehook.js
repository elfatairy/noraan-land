import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useCreateCourse = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseData) => {
    try {
      const response = await _execute('courses', 'POST', {
        name: courseData.name,
        description: courseData.description,
        groupPrice: courseData.groupPrice,
        privatePrice: courseData.privatePrice,
        zoomLink: courseData.zoomLink
      });
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};