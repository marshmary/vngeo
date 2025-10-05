import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FileManager from '@/components/admin/FileManager';
import QuizManager from '@/components/admin/QuizManager';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'files' | 'users' | 'quiz'>('files');

  // Initialize active tab from URL parameter
  useEffect(() => {
    const section = searchParams.get('section') as 'files' | 'users' | 'quiz' | null;
    if (section && ['files', 'users', 'quiz'].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'files' | 'users' | 'quiz') => {
    setActiveTab(tab);
    navigate(`/admin?section=${tab}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage files and system resources</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-2 inline-flex gap-2">
          <button
            onClick={() => handleTabChange('files')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              File Manager
            </div>
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Users
            </div>
          </button>
          <button
            onClick={() => handleTabChange('quiz')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Quiz Management
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'files' ? (
          <FileManager />
        ) : activeTab === 'quiz' ? (
          <QuizManager />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">User management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
