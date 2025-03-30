// Modified hook implementation
import { useCallback } from 'react';
import { useApiFetch } from '../utils/useApi';

export const useUploadRecords = () => {
    const { isLoading, error, data, setError, _execute } = useApiFetch();
    
    const execute = useCallback(async ( sessionId, formData) => {
        try {
            const response = await _execute(
                `admin/actions/uploadRecords/${sessionId}`,
                'POST',
                formData,
                {
                    headers: {
                        // Let browser set correct multipart boundary
                        'Content-Type': 'multipart/form-data'
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