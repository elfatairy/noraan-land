import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';
import axios from 'axios';

export const useGoogleLogin = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (accessToken) => {
    try {
      const googleUserInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const requestData = {
        email: googleUserInfo.data.email,
        password: googleUserInfo.data.sub, // Using Google's unique ID as password
      };

      return await _execute('users/auth/login', 'POST', requestData);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};