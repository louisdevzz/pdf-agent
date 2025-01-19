"use client";

import { useState, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatComponentProps {
  selectedFiles: File[];
}

export function ChatComponent({ selectedFiles }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('ChatComponent rendered with files:', selectedFiles.map(f => ({
    fileName: f.name,
    fileSize: f.size,
    fileType: f.type
  })));

  // Reset messages when files change
  useEffect(() => {
    setMessages([]);
  }, [selectedFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || selectedFiles.length === 0) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    // Debug logging
    console.log('Submitting chat with:', {
      question: input.trim(),
      fileCount: selectedFiles.length,
      fileNames: selectedFiles.map(f => f.name)
    });

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('question', userMessage.content);

      const response = await fetch("/api/ask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "I'm sorry, I couldn't process your request.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? error.message : "An error occurred while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Chat</h2>
        {selectedFiles.length > 0 ? (
          <p className="text-sm text-gray-600">
            Selected files: {selectedFiles.map(f => f.name).join(', ')}
          </p>
        ) : (
          <p className="text-sm text-red-500">
            Please select PDF files to start chatting
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Bot className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">How can I help you?</p>
            <p className="text-sm">Ask me anything about your PDF document</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div
                className={`flex-1 px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 px-4 py-2 rounded-lg bg-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFiles.length > 0 ? "Ask a question about your PDFs..." : "Please select PDF files first"}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || selectedFiles.length === 0}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || selectedFiles.length === 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
} 