import { useState, useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useLogin = () => {
   const { isLoading, error, data, setError, _execute } = useApiFetch();

   const execute = async (email, password, options = {}) => {
      try {
         const requestData = {
            email,
            password
         };
         
         const response = await _execute('users/auth/login', 'POST', requestData, {
           headers: {
             'Content-Type': 'application/json'
           },
           ...options
         });
         return response;
      } catch (error) {
         setError(error);
         throw error;
      }
   };

   return {
      isLoading,
      error,
      data,
      execute: useCallback(execute, [_execute]),
   };
};

export default useLogin;