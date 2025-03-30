import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const useDeleteGroups = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, groupId) => {
    try {
      const response = await _execute(`courses/${courseId}/groups/${groupId}`, 'DELETE');
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};