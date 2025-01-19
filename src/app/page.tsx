'use client';

import { useState } from 'react';
import { ChatComponent } from "@/components/ChatComponent";
import { Settings, Share2, Plus } from 'lucide-react';
import UploadModal from '@/components/UploadModal';

interface FileSource {
  id: string;
  name: string;
  type: string;
  file: File;
}

export default function Home() {
  const [files, setFiles] = useState<FileSource[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileSource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug logging
  console.log('Files state:', files.map(f => f.name));
  console.log('Selected files:', selectedFiles.map(f => f.name));

  const handleFileSelect = (newFiles: File[]) => {
    console.log('New files received:', newFiles.map(f => f.name));
    
    const newSources = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type,
      file: file
    }));
    
    setFiles(prev => [...prev, ...newSources]);
    setSelectedFiles(prev => [...prev, ...newSources]);
    setIsModalOpen(false);
  };

  const handleFileClick = (source: FileSource) => {
    console.log('Toggling file selection:', source.name);
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === source.id);
      if (isSelected) {
        return prev.filter(f => f.id !== source.id);
      } else {
        return [...prev, source];
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Sources */}
      <div className="w-72 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sources</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {files.length === 0 ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 px-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
            >
              + Add source
            </button>
          ) : (
            <div className="space-y-2">
              {files.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleFileClick(source)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                    selectedFiles.some(f => f.id === source.id)
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 truncate">
                    {source.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Conversation</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatComponent selectedFiles={selectedFiles.map(f => f.file)} />
        </div>
      </div>

      {/* Right Sidebar - Studio */}
      <div className="w-80 border-l bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Studio</h2>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
