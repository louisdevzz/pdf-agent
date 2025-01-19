'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFile(file);
    onFileSelect(file);
  }, [onFileSelect]);

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="flex items-center gap-2">
      {file ? (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
          <File className="h-4 w-4" />
          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          <button
            onClick={removeFile}
            className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <input {...getInputProps()} />
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isDragActive ? 'Drop here' : 'Upload PDF'}
          </span>
        </div>
      )}
    </div>
  );
} 