import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsService } from '@/services/settingsService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MapDrawingPage: React.FC = () => {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideoUrl();
  }, []);

  const loadVideoUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await SettingsService.getMapDrawingVideoUrl();

      if (url) {
        setVideoUrl(url);
      } else {
        setError(t('mapDrawing.videoNotFound'));
      }
    } catch (err) {
      console.error('Error loading video URL:', err);
      setError(t('mapDrawing.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('mapDrawing.error')}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadVideoUrl}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('mapDrawing.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('mapDrawing.title')}
          </h1>
          <p className="text-gray-600">
            {t('mapDrawing.description')}
          </p>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={videoUrl || ''}
              title={t('mapDrawing.videoTitle')}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('mapDrawing.instructions')}
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">1.</span>
              <span>{t('mapDrawing.step1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">2.</span>
              <span>{t('mapDrawing.step2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">3.</span>
              <span>{t('mapDrawing.step3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">4.</span>
              <span>{t('mapDrawing.step4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapDrawingPage;
