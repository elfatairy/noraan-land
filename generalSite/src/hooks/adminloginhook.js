import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useAdminLogin = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async (username, password, options = {}) => {
      try {
         const requestData = { username, password };
         const response = await _execute('admin/auth/login', 'POST', requestData, options);
         return response;
      } catch (error) {
         setError(error);
         throw error;
      }
   }, [_execute, setError]);

   return { isLoading, error, data, execute };
};

export default useAdminLogin;