import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useLogin = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async (email, password, options = {}) => {
      try {
         const requestData = {
            email,
            password
         };
         const response = await _execute('students/auth/login', 'POST', requestData, options);
         return response;
      } catch (error) {
         setError(error);
         throw error;
      }
   }, [_execute, setError]); // Added setError to dependency array

   return {
      isLoading,
      error,
      data,
      execute
   };
};

export default useLogin;