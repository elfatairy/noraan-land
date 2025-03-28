import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useRegister = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async (name, email, password, phone, options = {}) => {
      try {
         const requestData = {
            name,
            email,
            password,
            phone
         };
         const response = await _execute('students/auth/register', 'POST', requestData, options);
         return {
            success: true,
            data: response.data,
            message: response.message
         };
      } catch (error) {
         setError(error);
         return {
            success: false,
            error: error?.response?.data?.message || 'Registration failed'
         };
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