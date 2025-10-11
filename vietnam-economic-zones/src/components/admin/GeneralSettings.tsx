import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { SettingsService } from '@/services/settingsService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useUIStore();
  const [videoUrl, setVideoUrl] = useState('');
  const [feedbackUrl, setFeedbackUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalVideoUrl, setOriginalVideoUrl] = useState('');
  const [originalFeedbackUrl, setOriginalFeedbackUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const [videoUrlData, feedbackUrlData] = await Promise.all([
        SettingsService.getMapDrawingVideoUrl(),
        SettingsService.getFeedbackFormUrl()
      ]);

      if (videoUrlData) {
        setVideoUrl(videoUrlData);
        setOriginalVideoUrl(videoUrlData);
      }

      if (feedbackUrlData) {
        setFeedbackUrl(feedbackUrlData);
        setOriginalFeedbackUrl(feedbackUrlData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification(t('admin.settings.errorLoading'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    setHasChanges(newUrl !== originalVideoUrl || feedbackUrl !== originalFeedbackUrl);
  };

  const handleFeedbackUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setFeedbackUrl(newUrl);
    setHasChanges(videoUrl !== originalVideoUrl || newUrl !== originalFeedbackUrl);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const [videoSuccess, feedbackSuccess] = await Promise.all([
        SettingsService.updateMapDrawingVideoUrl(videoUrl),
        SettingsService.updateFeedbackFormUrl(feedbackUrl)
      ]);

      if (videoSuccess && feedbackSuccess) {
        setOriginalVideoUrl(videoUrl);
        setOriginalFeedbackUrl(feedbackUrl);
        setHasChanges(false);
        showNotification(t('admin.settings.settingsSaved'), 'success');
      } else {
        showNotification(t('admin.settings.errorSaving'), 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification(t('admin.settings.errorSaving'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setVideoUrl(originalVideoUrl);
    setFeedbackUrl(originalFeedbackUrl);
    setHasChanges(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('admin.settings.title')}
        </h2>
        <p className="text-gray-600">
          {t('admin.settings.description')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Map Drawing Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('admin.settings.videoUrl')}
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {t('admin.settings.videoUrlDescription')}
          </p>
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={handleVideoUrlChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://www.youtube.com/embed/VIDEO_ID"
          />
          {videoUrl && !isValidUrl(videoUrl) && (
            <p className="mt-2 text-sm text-red-600">
              {t('admin.settings.invalidUrl')}
            </p>
          )}
        </div>

        {/* Feedback Form URL */}
        <div>
          <label htmlFor="feedbackUrl" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('admin.settings.feedbackUrl')}
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {t('admin.settings.feedbackUrlDescription')}
          </p>
          <input
            type="text"
            id="feedbackUrl"
            value={feedbackUrl}
            onChange={handleFeedbackUrlChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true"
          />
          {feedbackUrl && !isValidUrl(feedbackUrl) && (
            <p className="mt-2 text-sm text-red-600">
              {t('admin.settings.invalidUrl')}
            </p>
          )}
        </div>

        {/* Preview */}
        {videoUrl && isValidUrl(videoUrl) && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('admin.settings.preview')}
            </label>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={videoUrl}
                  title="Video Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.settings.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || !isValidUrl(videoUrl) || !isValidUrl(feedbackUrl)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('admin.settings.saving')}
              </>
            ) : (
              t('admin.settings.saveChanges')
            )}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 {t('admin.settings.tips')}
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('admin.settings.tip1')}</li>
          <li>• {t('admin.settings.tip2')}</li>
          <li>• {t('admin.settings.tip3')}</li>
        </ul>
      </div>
    </div>
  );
};

export default GeneralSettings;
