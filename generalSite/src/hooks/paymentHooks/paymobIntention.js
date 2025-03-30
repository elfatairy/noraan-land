import { useCallback } from 'react';
import { useApiFetch } from '../../utils/useApi';

export const usePaymobIntention = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async (courseId) => {
      try {
         const response = await _execute(`students/actions/intentPaymob/${courseId}`, 'POST');
         return response;
      } catch (error) {
         setError(error);
         throw error;
      }
   }, [_execute, setError]);

   return { isLoading, error, data, execute };
};

export default usePaymobIntention;