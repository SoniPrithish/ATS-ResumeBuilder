import { useState } from 'react';
import { toast } from 'sonner';

interface UseFileUploadReturn {
    upload: (file: File) => Promise<Record<string, unknown>>;
    file: File | null;
    progress: number;
    error: string | null;
    isUploading: boolean;
    reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const reset = () => {
        setFile(null);
        setProgress(0);
        setError(null);
        setIsUploading(false);
    };

    const upload = async (selectedFile: File) => {
        reset();
        setFile(selectedFile);
        setIsUploading(true);
        setProgress(10); // initial start progress

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // We'll simulate progress with an interval, since fetch doesn't support native upload progress easily
            const progressInterval = setInterval(() => {
                setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
            }, 500);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                let errorMessage = 'Upload failed';
                try {
                    const errorJson = await response.json() as { error?: string };
                    if (errorJson?.error) {
                        errorMessage = errorJson.error;
                    }
                } catch {
                    errorMessage = `Upload failed (HTTP ${response.status})`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setIsUploading(false);
            return result;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error uploading file';
            setError(errorMessage);
            setIsUploading(false);
            setProgress(0);
            toast.error('Upload failed', {
                description: errorMessage,
            });
            throw err;
        }
    };

    return { upload, file, progress, error, isUploading, reset };
}
// group 1 modifications
