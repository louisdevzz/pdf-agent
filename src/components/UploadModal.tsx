'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, Youtube, Globe, Cloud } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (files: File[]) => void;
}

export default function UploadModal({ isOpen, onClose, onFileSelect }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      if (files.length > 0) {
        onFileSelect(files);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Add Source</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sources help NotebookLM provide answers based on the most important information for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.md"
            multiple
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drag and drop or <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-500 hover:text-blue-600"
              >
                choose files
              </button> to upload
            </p>
            <p className="text-xs text-gray-500">
              Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
            </p>
          </div>
        </div>

        {/* Source Options */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <Cloud className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">Google Docs</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" /> Google Docs
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" /> Google Slides
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <Globe className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">Link</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2" /> Website
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Youtube className="h-4 w-4 mr-2" /> YouTube
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">Paste Text</h3>
            <p className="text-sm text-gray-600 mt-2">
              Copied text
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 