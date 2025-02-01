import { useState, useCallback } from "react";
import { getStorageData } from "./data";
import axios from "axios";

const BASE_URL = 'http://nooranland.com/api';
// const BASE_URL = 'http://localhost:3001/api';

export const useApiFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = async (url, method = "GET", body, options = {}) => {
    try {
      setIsLoading(true);
      const token = await getStorageData("token");
      
      const config = {
        ...options,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        }
      };

      const response = await axios({
        method,
        url: `${BASE_URL}/${url}`,
        data: body,
        ...config
      });

      setData(response.data);
      setIsLoading(false);
      return response.data;
    } catch (e) {
      setError(e);
      setIsLoading(false);
      throw e;
    }
  };

  return {
    isLoading,
    error,
    data,
    setError,
    _execute: useCallback(execute, []),
  };
};