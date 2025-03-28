import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';
import axios from 'axios';

export const useGoogleLogin = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const execute = useCallback(async (accessToken, phone = "") => {
    try {
      // Get the ID token from Google
      const tokenInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/tokeninfo',
        {
          params: { 
            access_token: accessToken
          }
        }
      );

      const requestData = {
        idToken: tokenInfo.data.sub,
        phone: phone
      };

      return await _execute('students/auth/google-login', 'POST', requestData);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute };
};