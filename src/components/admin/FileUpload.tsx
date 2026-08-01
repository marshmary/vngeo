import React, { useState, useRef } from 'react';
import { DocumentService } from '@/services/documentService';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  onCreateFolder: (folderName: string) => void;
  onClose: () => void;
  currentPath: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, onCreateFolder, onClose, currentPath }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'upload' | 'folder'>('upload');
  const [folderName, setFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const maxSize = import.meta.env.VITE_SUPABASE_MAX_FILE_SIZE || 52428800;

      // Check for oversized files
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert(
          `The following files exceed the ${DocumentService.getMaxFileSizeMB()}MB size limit:\n\n` +
          oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')
        );
        return;
      }

      setSelectedFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const maxSize = import.meta.env.VITE_SUPABASE_MAX_FILE_SIZE || 52428800;

      // Check for oversized files
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert(
          `The following files exceed the ${DocumentService.getMaxFileSizeMB()}MB size limit:\n\n` +
          oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')
        );
        return;
      }

      setSelectedFiles(files);
    }
  };

  const handleSubmit = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      if (mode === 'upload' && selectedFiles.length > 0) {
        await onUpload(selectedFiles);
      } else if (mode === 'folder' && folderName.trim()) {
        await onCreateFolder(folderName.trim());
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'upload' ? 'Upload Files' : 'Create Folder'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Current path: {currentPath || '/'}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-6">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setMode('upload')}
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isUploading
                  ? 'cursor-not-allowed opacity-50'
                  : mode === 'upload'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Files
            </button>
            <button
              onClick={() => setMode('folder')}
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isUploading
                  ? 'cursor-not-allowed opacity-50'
                  : mode === 'folder'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              Create Folder
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'upload' ? (
            <>
              {/* Drop Zone */}
              <div
                onDragEnter={isUploading ? undefined : handleDrag}
                onDragLeave={isUploading ? undefined : handleDrag}
                onDragOver={isUploading ? undefined : handleDrag}
                onDrop={isUploading ? undefined : handleDrop}
                onClick={isUploading ? undefined : () => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isUploading
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : dragActive
                    ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  onChange={handleChange}
                  disabled={isUploading}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    {isUploading ? (
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="w-8 h-8 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isUploading ? 'Uploading files...' : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {isUploading
                        ? 'Please wait while your files are being uploaded'
                        : `Support for PDF, images, and documents (Max ${DocumentService.getMaxFileSizeMB()}MB per file)`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  disabled={isUploading}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    isUploading ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''
                  }`}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Selected Files List */}
          {mode === 'upload' && selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg
                        className="w-8 h-8 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isUploading ||
              (mode === 'upload' ? selectedFiles.length === 0 : !folderName.trim())
            }
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              isUploading
                ? 'bg-indigo-400 text-white cursor-not-allowed'
                : (mode === 'upload' && selectedFiles.length > 0) || (mode === 'folder' && folderName.trim())
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                {mode === 'upload' ? 'Uploading...' : 'Creating...'}
              </>
            ) : (
              <>
                {mode === 'upload'
                  ? `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
                  : 'Create Folder'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
