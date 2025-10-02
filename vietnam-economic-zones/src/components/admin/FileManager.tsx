import React, { useState, useEffect } from 'react';
import FileCard from './FileCard';
import FileUpload from './FileUpload';
import { DocumentService } from '@/services/documentService';
import { useAuthStore } from '@/stores/authStore';

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'image' | 'document' | 'other';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  path: string;
}

const FileManager: React.FC = () => {
  const { user } = useAuthStore();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storageFiles = await DocumentService.listFiles(currentPath);
      const fileItems: FileItem[] = storageFiles
        .filter((file) => file.name !== '.folderkeep') // Hide folder placeholder
        .map((file) => {
          // Generate unique ID using path + name
          const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
          return {
            id: file.id || fullPath, // Use Supabase ID or fallback to path
            name: file.name,
            type: getFileType(file.name, file.metadata?.mimetype, file.metadata),
            size: file.metadata?.size || 0,
            uploadedAt: new Date(file.created_at),
            uploadedBy: user?.user_metadata?.username || user?.email || 'Unknown',
            path: fullPath,
          };
        });
      setFiles(fileItems);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
      // Set empty files array on error to avoid showing stale data
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load files from Supabase
  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const handleUpload = async (uploadedFiles: File[]) => {
    try {
      setIsLoading(true);
      await DocumentService.uploadFiles(uploadedFiles, currentPath);
      await loadFiles();
      setShowUpload(false);
    } catch (err) {
      console.error('Failed to upload files:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      setIsLoading(true);
      await DocumentService.createFolder(folderName, currentPath);
      await loadFiles();
      setShowUpload(false);
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;

    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        setIsLoading(true);
        if (file.type === 'folder') {
          await DocumentService.deleteFolder(file.path);
        } else {
          await DocumentService.deleteFile(file.path);
        }
        await loadFiles();
      } catch (err) {
        console.error('Failed to delete file:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete file');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };


  const getFileType = (filename: string, mimetype?: string, metadata?: any): FileItem['type'] => {
    // Check if it's a folder using Supabase Storage conventions
    // Folders have null id in the metadata or specific mimetype
    if (!metadata || mimetype === 'application/x-directory') {
      return 'folder';
    }

    // If no file extension, it's likely a folder
    if (!filename.includes('.')) {
      return 'folder';
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image';
    if (['doc', 'docx', 'txt'].includes(ext || '')) return 'document';
    return 'other';
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {currentPath && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setCurrentPath('')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Home
            </button>
            {currentPath.split('/').map((folder, index, array) => (
              <React.Fragment key={index}>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {index === array.length - 1 ? (
                  <span className="text-gray-900 font-medium">{folder}</span>
                ) : (
                  <button
                    onClick={() => setCurrentPath(array.slice(0, index + 1).join('/'))}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {folder}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Total Files</span>
            <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{files.length}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Total Size</span>
            <svg className="w-8 h-8 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">
            {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Folders</span>
            <svg className="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">
            {files.filter((file) => file.type === 'folder').length}
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">No files found</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            }
          >
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                viewMode={viewMode}
                onDelete={handleDelete}
                onFolderClick={file.type === 'folder' ? () => handleFolderClick(file.name) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <FileUpload
          onUpload={handleUpload}
          onCreateFolder={handleCreateFolder}
          onClose={() => setShowUpload(false)}
          currentPath={currentPath || '/'}
        />
      )}
    </div>
  );
};

export default FileManager;
