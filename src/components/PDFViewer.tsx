'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  file: File | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Update filePreview when file changes
  useEffect(() => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setFilePreview(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF Selected</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Upload a PDF file to preview its contents
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with file info */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
            <p className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
            </p>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        {filePreview ? (
          <iframe
            src={filePreview}
            className="w-full h-full"
            title="PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>Loading preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 