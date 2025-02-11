import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useUpdateProfile = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = useCallback(async ({ name, age, gender, location }, options = {}) => {
      try {
         const requestData = {
            name,
            age,
            gender,
            location
         };
         const response = await _execute('users/auth/update-profile', 'PATCH', requestData, options);
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

export default useUpdateProfile;