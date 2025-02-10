import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useRegister = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async (name, email, password, options = {}) => {
      try {
         const requestData = {
            name,
            email,
            password
         };
         const response = await _execute('users/auth/register', 'POST', requestData, options);
         return response;
      } catch (error) {
         setError(error);
         throw error;
      }
   }, [_execute, setError]);

   return {
      isLoading,
      error,
      data,
      execute
   };
};

export default useRegister;