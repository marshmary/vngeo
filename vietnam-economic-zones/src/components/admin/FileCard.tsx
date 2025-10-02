import React, { useState } from 'react';
import type { FileItem } from './FileManager';

interface FileCardProps {
  file: FileItem;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
  onFolderClick?: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, viewMode, onDelete, onFolderClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getFileIcon = () => {
    switch (file.type) {
      case 'folder':
        return (
          <svg className="w-full h-full text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm0 2h5v4h4v10H7V4z" />
            <text x="8" y="15" fontSize="6" fill="currentColor" fontWeight="bold">PDF</text>
          </svg>
        );
      case 'image':
        return (
          <svg className="w-full h-full text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v16h12V4H6zm2 3a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-full h-full text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
            <path fill="white" d="M13 3.5V9h5.5L13 3.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onFolderClick}
        className={`flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all group ${
          onFolderClick ? 'cursor-pointer' : ''
        }`}
      >
        {/* Icon */}
        <div className="w-10 h-10 flex-shrink-0">{getFileIcon()}</div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.name}</p>
        </div>

        {/* Size */}
        <div className="w-24 text-sm text-gray-500">{formatFileSize(file.size)}</div>

        {/* Date */}
        <div className="w-32 text-sm text-gray-500">
          {file.type === 'folder' ? '—' : formatDate(file.uploadedAt)}
        </div>

        {/* Uploaded By */}
        <div className="w-32 text-sm text-gray-500">
          {file.type === 'folder' ? '—' : file.uploadedBy}
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <button
                onClick={() => {
                  onDelete(file.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onFolderClick}
      className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all group relative border border-gray-100 ${
        onFolderClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-14 right-4 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <button
            onClick={() => {
              onDelete(file.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Icon */}
      <div className="w-16 h-16 mb-4">{getFileIcon()}</div>

      {/* File Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 truncate" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          {file.type !== 'folder' && <span>{formatDate(file.uploadedAt)}</span>}
        </div>
        {file.type !== 'folder' && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {file.uploadedBy.charAt(0)}
            </div>
            <span className="text-xs text-gray-600">{file.uploadedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCard;
