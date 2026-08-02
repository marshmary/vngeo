import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui';
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
      const maxSize = DocumentService.getMaxFileSizeBytes();

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
      const maxSize = DocumentService.getMaxFileSizeBytes();

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
      <div className="bg-card rounded-card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'upload' ? 'Upload Files' : 'Create Folder'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Current path: {currentPath || '/'}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-2 hover:bg-sunken rounded-button transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-6">
          <div className="flex bg-sunken rounded-card p-1">
            <button
              onClick={() => setMode('upload')}
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-button font-medium transition-all ${
                isUploading
                  ? 'cursor-not-allowed opacity-50'
                  : mode === 'upload'
                  ? 'bg-card text-brand shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-button font-medium transition-all ${
                isUploading
                  ? 'cursor-not-allowed opacity-50'
                  : mode === 'folder'
                  ? 'bg-card text-brand shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
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
                className={`border-2 border-dashed rounded-card p-12 text-center transition-all ${
                  isUploading
                    ? 'border-border bg-muted cursor-not-allowed opacity-50'
                    : dragActive
                    ? 'border-brand bg-brand-subtle cursor-pointer'
                    : 'border-border hover:border-brand hover:bg-muted cursor-pointer'
                }`}
              >
                <input
                  ref={inputRef}
                  data-testid="document-upload-input"
                  type="file"
                  multiple
                  onChange={handleChange}
                  disabled={isUploading}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-brand-subtle rounded-full flex items-center justify-center">
                    {isUploading ? (
                      <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="w-8 h-8 text-brand"
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
                    <p className="text-lg font-semibold text-foreground">
                      {isUploading ? 'Uploading files...' : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
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
              <div className="mx-auto w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-foreground mb-2">
                  Folder Name
                </label>
                <Input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  disabled={isUploading}
                  className={isUploading ? 'cursor-not-allowed opacity-50' : ''}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Selected Files List */}
          {mode === 'upload' && selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-foreground">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-card"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg
                        className="w-8 h-8 text-faint-foreground flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 hover:bg-danger-soft rounded-button transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-danger"
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            data-testid="document-upload-cancel"
            onClick={onClose}
            disabled={isUploading}
            className={`px-6 py-3 text-muted-foreground hover:bg-sunken rounded-button font-medium transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            data-testid="document-upload-submit"
            onClick={handleSubmit}
            disabled={
              isUploading ||
              (mode === 'upload' ? selectedFiles.length === 0 : !folderName.trim())
            }
            className={`px-6 py-3 rounded-button font-medium transition-all flex items-center gap-2 ${
              isUploading
                ? 'bg-brand/70 text-brand-foreground cursor-not-allowed'
                : (mode === 'upload' && selectedFiles.length > 0) || (mode === 'folder' && folderName.trim())
                ? 'bg-brand text-brand-foreground hover:bg-brand-hover shadow-card'
                : 'bg-muted text-faint-foreground cursor-not-allowed'
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
