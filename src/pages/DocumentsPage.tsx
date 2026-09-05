import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { DocumentsPageService, type DocumentFolder, type DocumentFile } from '@/services/documentsPageService';
import { Button, Pagination, Spinner } from '@/components/ui';

const DocumentsPage: React.FC = () => {
  const { language } = useUIStore();
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Load documents from Supabase (with StrictMode protection)
  useEffect(() => {
    let cancelled = false;

    const loadDocuments = async () => {
      console.log('[DocumentsPage] Starting document load...');
      try {
        setIsLoading(true);
        setError(null);
        console.log('[DocumentsPage] Calling DocumentsPageService.getDocumentsByFolders() with forceRefresh=true...');
        // Force refresh on mount to ensure we always fetch fresh data when navigating to the page
        const foldersData = await DocumentsPageService.getDocumentsByFolders(true);

        // Prevent state update if component unmounted
        if (cancelled) {
          console.log('[DocumentsPage] Component unmounted, skipping state update');
          return;
        }

        console.log('[DocumentsPage] Documents loaded successfully:', foldersData);
        setFolders(foldersData);
      } catch (err) {
        if (cancelled) return;
        console.error('[DocumentsPage] Error loading documents:', err);
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        if (!cancelled) {
          console.log('[DocumentsPage] Setting isLoading to false');
          setIsLoading(false);
        }
      }
    };

    loadDocuments();

    // Cleanup function to cancel on unmount
    return () => {
      cancelled = true;
    };
  }, []);

  // Get all documents or documents from selected folder
  const getDisplayDocuments = (): DocumentFile[] => {
    if (selectedFolder === 'all') {
      return folders.flatMap(folder => folder.documents);
    }
    const folder = folders.find(f => f.name === selectedFolder);
    return folder ? folder.documents : [];
  };

  const allDocuments = getDisplayDocuments();
  const totalPages = Math.ceil(allDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayDocuments = allDocuments.slice(startIndex, startIndex + itemsPerPage);
  const categories = folders.map(folder => folder.name);

  // Reset to page 1 when folder changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolder]);

  return (
    <div data-testid="documents-page" className="main-container scrollable">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {language === 'vi' ? 'Tài Liệu Vùng Địa Lý' : 'Geography Zone Documents'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'vi'
                    ? 'Tổng hợp tài liệu nghiên cứu về các vùng địa lý và kinh tế của Việt Nam'
                    : 'Collection of research documents about Vietnam\'s geographical and economic zones'
                  }
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  DocumentsPageService.getDocumentsByFolders(true)
                    .then(setFolders)
                    .catch(err => {
                      console.error('Error refreshing documents:', err);
                      setError(err instanceof Error ? err.message : 'Failed to load documents');
                    })
                    .finally(() => setIsLoading(false));
                }}
                disabled={isLoading}
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {language === 'vi' ? 'Làm mới' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedFolder('all')}
                className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
                  selectedFolder === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-sunken text-foreground hover:bg-border'
                }`}
              >
                {language === 'vi' ? 'Tất cả' : 'All'} ({folders.reduce((total, folder) => total + folder.count, 0)})
              </button>
              {categories.map(category => {
                const folder = folders.find(f => f.name === category);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedFolder(category)}
                    className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
                      selectedFolder === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-sunken text-foreground hover:bg-border'
                    }`}
                  >
                    {category} ({folder?.count || 0})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner className="h-12 w-12 mx-auto mb-4" />
                <p className="text-muted-foreground">{language === 'vi' ? 'Đang tải tài liệu...' : 'Loading documents...'}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-danger-soft border border-danger/30 rounded-card p-6 text-center">
              <div className="w-12 h-12 bg-danger-soft rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-danger-strong mb-2">
                {language === 'vi' ? 'Lỗi tải tài liệu' : 'Error Loading Documents'}
              </h3>
              <p className="text-danger-strong">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && allDocuments.length === 0 && (
            <div className="bg-muted border border-border rounded-card p-12 text-center">
              <div className="w-16 h-16 bg-sunken rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-faint-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === 'vi' ? 'Không có tài liệu' : 'No Documents Found'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'vi'
                  ? 'Chưa có tài liệu nào trong thư mục này.'
                  : 'No documents found in this folder.'
                }
              </p>
            </div>
          )}

          {/* Documents Grid */}
          {!isLoading && !error && allDocuments.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayDocuments.map(document => {
                  const fileSize = DocumentsPageService.formatFileSize(document.size);

                  return (
                    <div key={document.id} data-testid="document-card" data-document-id={document.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
                      {/* Document Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-danger-soft rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {document.folder}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{document.fileExtension}</span>
                      </div>

                      {/* Document Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {document.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {language === 'vi'
                            ? `Tài liệu từ thư mục ${document.folder}`
                            : `Document from ${document.folder} folder`
                          }
                        </p>
                      </div>

                      {/* Document Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{fileSize}</span>
                        <a
                          href={document.downloadUrl}
                          download={document.name}
                          className="px-4 py-2 bg-brand text-white rounded-button text-sm font-medium hover:bg-brand-hover transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{language === 'vi' ? 'Tải về' : 'Download'}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                previousPageLabel="Previous page"
                nextPageLabel="Next page"
              />
            </>
          )}


          {/* Additional Info */}
          <div className="mt-12 bg-blue-50 rounded-card p-6 border border-info-soft">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-info-soft rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-info-strong mb-2">
                  {language === 'vi' ? 'Thông Tin Bổ Sung' : 'Additional Information'}
                </h3>
                <p className="text-info-strong">
                  {language === 'vi'
                    ? 'Tất cả tài liệu được cung cấp chỉ phục vụ mục đích giáo dục và nghiên cứu. Để biết thêm thông tin chi tiết, vui lòng liên hệ với các cơ quan chức năng có thẩm quyền.'
                    : 'All documents are provided for educational and research purposes only. For detailed information, please contact the relevant authorities.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;