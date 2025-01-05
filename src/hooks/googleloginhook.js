import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';
import axios from 'axios';

export const useGoogleLogin = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (accessToken) => {
    try {
      // Get Google user profile
      const profileResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const requestData = {
        email: profileResponse.data.email,
        password: profileResponse.data.sub, // Using Google's unique ID as password
        name: profileResponse.data.name
      };

      return await _execute('users/auth/google-login', 'POST', requestData);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};