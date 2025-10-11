import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { SettingsService } from '@/services/settingsService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const FeedbackPage: React.FC = () => {
  const { language } = useUIStore();
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbackUrl();
  }, []);

  const loadFeedbackUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await SettingsService.getFeedbackFormUrl();

      if (url) {
        setFeedbackUrl(url);
      } else {
        setError(language === 'vi'
          ? 'Không tìm thấy biểu mẫu phản hồi. Vui lòng liên hệ quản trị viên.'
          : 'Feedback form not found. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error loading feedback form URL:', err);
      setError(language === 'vi'
        ? 'Không thể tải biểu mẫu phản hồi. Vui lòng thử lại sau.'
        : 'Unable to load feedback form. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner
          size="lg"
          message={language === 'vi' ? 'Đang tải biểu mẫu phản hồi...' : 'Loading feedback form...'}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {language === 'vi' ? 'Lỗi' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFeedbackUrl}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {language === 'vi' ? 'Thử lại' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Phản hồi' : 'Feedback'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'vi'
              ? 'Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện dịch vụ'
              : 'Share your feedback to help us improve our service'}
          </p>
        </div>
      </div>

      {/* Google Form Embed */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
            {feedbackUrl && (
              <iframe
                src={feedbackUrl}
                className="w-full h-full"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title={language === 'vi' ? 'Biểu mẫu phản hồi' : 'Feedback Form'}
              >
                {language === 'vi' ? 'Đang tải...' : 'Loading...'}
              </iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
