'use client';

import { useState, useCallback } from 'react';
import { X, Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeBaseManagerProps {
  partnerId: string;
  onClose: () => void;
}

interface FileItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunkCount?: number;
  createdAt: string;
}

export function KnowledgeBaseManager({ partnerId, onClose }: KnowledgeBaseManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [partnerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('partnerId', partnerId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles((prev) => [data.data, ...prev]);

        // 自动触发向量化
        await triggerEmbedding(data.data.id);
      } else {
        console.error('上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerEmbedding = async (knowledgeBaseId: string) => {
    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgeBaseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === knowledgeBaseId
              ? { ...f, status: 'completed', chunkCount: data.data.chunkCount }
              : f
          )
        );
      }
    } catch (error) {
      console.error('向量化失败:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === knowledgeBaseId ? { ...f, status: 'failed' } : f
        )
      );
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/knowledge-base/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-80 bg-tavern-panel border-l border-tavern-border flex flex-col flex-shrink-0">
      {/* 头部 */}
      <div className="p-4 border-b border-tavern-border flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          知识库
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-tavern-border"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* 上传区域 */}
        <div className="p-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive
                ? 'border-love-500 bg-love-500/10'
                : 'border-tavern-border hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-300 mb-1">拖拽文件到此处</p>
            <p className="text-xs text-gray-500 mb-3">或</p>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.md,.pdf,.docx,.csv,.json"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="border-tavern-border text-gray-300 hover:bg-tavern-border"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                选择文件
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-3">
              支持: TXT, MD, PDF, DOCX, CSV, JSON
              <br />
              最大 50MB
            </p>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            已上传文件 ({files.length})
          </h3>
          <div className="space-y-2">
            {files.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                暂无文件
              </p>
            )}
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-tavern-dark rounded-lg p-3 border border-tavern-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.fileSize)}
                      {file.chunkCount && (
                        <span className="ml-2">· {file.chunkCount} 片段</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {getStatusIcon(file.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="p-4 border-t border-tavern-border">
          <h4 className="text-xs font-medium text-gray-400 mb-2">使用说明</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>· 上传文件后系统会自动处理</li>
            <li>· 伴侣会学习文件内容来更好地回复</li>
            <li>· 支持多种文档格式</li>
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
