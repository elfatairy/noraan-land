import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useAssignToGroup = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (studentId, courseId, groupId) => {
    try {
      const response = await _execute(`students/${studentId}/courses/${courseId}/assignGroup`, 'PATCH', { groupId: parseInt(groupId) });
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};