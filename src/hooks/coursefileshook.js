import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useCourseFiles = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch();

  const openFolder = useCallback(async (courseId, path = '') => {
    try {
      return await _execute(`materials/folder/${courseId}/${path}`, 'GET');
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  const createFolder = useCallback(async (courseId, path = '', name) => {
    try {
      return await _execute(`materials/folder/${courseId}/${path}`, 'POST', { name });
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  const downloadFile = useCallback(async (courseId, path) => {
    try {
      const response = await _execute(`materials/file/${courseId}/${path}`, 'GET', null, { responseType: 'blob' });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', path.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  const uploadFile = useCallback(async (courseId, path = '', file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await _execute(`materials/file/${courseId}/${path}`, 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  const renameItem = useCallback(async (courseId, path, name) => {
    try {
      return await _execute(`materials/${courseId}/${path}`, 'PATCH', { name });
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  const deleteItem = useCallback(async (courseId, path) => {
    try {
      return await _execute(`materials/${courseId}/${path}`, 'DELETE');
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [_execute, setError]);

  return {
    isLoading,
    error,
    openFolder,
    createFolder,
    downloadFile,
    uploadFile,
    renameItem,
    deleteItem
  };
};