import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useApprovePaypal = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (courseId, subscriptionId) => {
    try {
      const response = await _execute(`users/actions/approvePaypal/${courseId}`, 'POST', {
        subscriptionId
      });
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};