// Modified hook implementation
import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useUploadRecords = () => {
    const { isLoading, error, data, setError, _execute } = useApiFetch();
    
    const execute = useCallback(async (sessionType, sessionId, formData) => {
        try {
            const response = await _execute(
                `admin/actions/uploadRecords/${sessionType}/${sessionId}`,
                'POST',
                formData,
                {
                    headers: {
                        // Remove Content-Type header to let the browser set it with the boundary
                        // 'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error('API Error:', error);
            setError(error);
            throw error;
        }
    }, [_execute, setError]);

    return { isLoading, error, data, execute };
};