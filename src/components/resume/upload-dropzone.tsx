"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useRouter } from "next/navigation";

export function UploadDropzone() {
    const { upload, progress, error, isUploading, reset } = useFileUpload();
    const [localFile, setLocalFile] = useState<File | null>(null);
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setLocalFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 1,
        disabled: isUploading || success
    });

    const handleUpload = async () => {
        if (!localFile) return;
        try {
            const response = await upload(localFile);
            if (response && response.resumeId) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/resumes/${response.resumeId}`);
                }, 1500);
            }
        } catch {
            // Error is handled by hook
        }
    };

    const handleClear = () => {
        setLocalFile(null);
        reset();
        setSuccess(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            {!localFile ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
          `}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drag & drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">
                        Supports PDF and DOCX (Max 5MB)
                    </p>
                    <Button variant="outline" type="button">Select File</Button>
                </div>
            ) : (
                <div className="border rounded-xl p-6 bg-card">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <FileIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{localFile.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {(localFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        </div>
                        {!isUploading && !success && (
                            <Button variant="ghost" size="icon" onClick={handleClear}>
                                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            </Button>
                        )}
                    </div>

                    {isUploading && (
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 p-4 bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 rounded-lg flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <span>Resume uploaded successfully! Parsing data...</span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <div className="flex flex-col flex-1">
                                <span className="font-medium">Upload failed</span>
                                <span className="text-sm opacity-90">{error}</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleClear} className="bg-background text-foreground">
                                Try again
                            </Button>
                        </div>
                    )}

                    {!isUploading && !success && !error && (
                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleUpload} className="w-full sm:w-auto" size="lg">
                                Upload & Parse
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
