import React, { useEffect } from 'react';
import InteractiveMapContainer from '@/components/map/InteractiveMapContainer';
import ZoneCard from '@/components/zone/ZoneCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';

const HomePage: React.FC = () => {
  const {
    zones,
    selectedZone,
    isLoading,
    error,
    loadZones,
    getZoneById,
    setSelectedZone
  } = useMapStore();

  const { language } = useUIStore();

  useEffect(() => {
    // Load zones on component mount
    if (zones.length === 0) {
      loadZones();
    }
  }, [loadZones, zones.length]);

  const selectedZoneData = selectedZone ? getZoneById(selectedZone) : null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Application
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadZones}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus-ring"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-vietnam-red rounded mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">VN</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {language === 'vi'
                    ? 'Khám Phá Các Vùng Kinh Tế Việt Nam'
                    : 'Vietnam Economic Zones Explorer'
                  }
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'vi'
                    ? 'Công cụ giáo dục cho học sinh trung học phổ thông'
                    : 'Educational Tool for High School Students'
                  }
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => useUIStore.getState().setLanguage('vi')}
                className={`px-3 py-1 text-sm rounded ${
                  language === 'vi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } focus-ring`}
              >
                VI
              </button>
              <button
                onClick={() => useUIStore.getState().setLanguage('en')}
                className={`px-3 py-1 text-sm rounded ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } focus-ring`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner
              size="lg"
              message={language === 'vi' ? 'Đang tải bản đồ...' : 'Loading map...'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content: Map and Zone Details */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {language === 'vi' ? 'Bản Đồ Tương Tác' : 'Interactive Map'}
                </h2>

                {/* Map Container */}
                <div className="mb-6">
                  <InteractiveMapContainer />
                </div>

                {/* Enhanced Map Instructions */}
                <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        {language === 'vi' ? 'Hướng dẫn sử dụng bản đồ:' : 'How to use the interactive map:'}
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>
                          {language === 'vi'
                            ? '• Di chuột qua các vùng để xem thông tin nhanh'
                            : '• Hover over zones for quick info'
                          }
                        </li>
                        <li>
                          {language === 'vi'
                            ? '• Nhấp vào vùng để chọn và phóng to'
                            : '• Click zones to select and zoom'
                          }
                        </li>
                        <li>
                          {language === 'vi'
                            ? '• Sử dụng các nút điều khiển để điều hướng'
                            : '• Use controls for navigation'
                          }
                        </li>
                        <li>
                          {language === 'vi'
                            ? '• Nhấp vào vùng trống để bỏ chọn'
                            : '• Click empty area to deselect'
                          }
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Zone Details Section - Inside Map Container */}
                {selectedZoneData && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {language === 'vi' ? 'Chi Tiết Vùng Được Chọn' : 'Selected Zone Details'}
                      </h3>
                      <button
                        onClick={() => setSelectedZone(null)}
                        className="text-gray-400 hover:text-gray-600 focus-ring p-1 rounded"
                        aria-label="Close zone details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Zone Overview */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {selectedZoneData.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language === 'vi' ? selectedZoneData.nameVi : selectedZoneData.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedZoneData.region}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {language === 'vi' ? selectedZoneData.descriptionVi : selectedZoneData.description}
                          </p>
                        </div>

                        {/* Zone Color Indicator */}
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedZoneData.color }}
                          ></div>
                          <span className="text-xs text-gray-600">
                            {language === 'vi' ? 'Màu vùng trên bản đồ' : 'Zone color on map'}
                          </span>
                        </div>
                      </div>

                      {/* Key Statistics */}
                      <div>
                        <h5 className="font-medium text-gray-800 mb-3 text-sm">
                          {language === 'vi' ? 'Thống Kê Chính' : 'Key Statistics'}
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <div className="text-xs font-medium text-blue-800">
                              {language === 'vi' ? 'Dân số' : 'Population'}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {(selectedZoneData.population / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded border border-green-100">
                            <div className="text-xs font-medium text-green-800">GDP</div>
                            <div className="text-lg font-bold text-green-600">
                              ${(selectedZoneData.gdp / 1000000000).toFixed(1)}B
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded border border-purple-100">
                            <div className="text-xs font-medium text-purple-800">
                              {language === 'vi' ? 'Diện tích' : 'Area'}
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                              {selectedZoneData.area.toLocaleString()} km²
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded border border-orange-100">
                            <div className="text-xs font-medium text-orange-800">
                              {language === 'vi' ? 'Thành lập' : 'Established'}
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              {selectedZoneData.establishedYear}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Industries and Cities */}
                      <div className="space-y-4">
                        {/* Industries */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2 text-sm">
                            {language === 'vi' ? 'Ngành Công Nghiệp' : 'Industries'}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {selectedZoneData.industries.map((industry) => (
                              <span
                                key={industry}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Major Cities */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2 text-sm">
                            {language === 'vi' ? 'Thành Phố Chính' : 'Major Cities'}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {selectedZoneData.majorCities.map((city) => (
                              <span
                                key={city}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                              >
                                {city}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Economic Activities */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2 text-sm">
                            {language === 'vi' ? 'Cơ Cấu Kinh Tế' : 'Economic Structure'}
                          </h5>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {language === 'vi' ? 'Nông nghiệp' : 'Agriculture'}
                              </span>
                              <span className="text-xs font-medium text-green-600">
                                {selectedZoneData.economicActivities.agriculture}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {language === 'vi' ? 'Công nghiệp' : 'Industry'}
                              </span>
                              <span className="text-xs font-medium text-blue-600">
                                {selectedZoneData.economicActivities.industry}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {language === 'vi' ? 'Dịch vụ' : 'Services'}
                              </span>
                              <span className="text-xs font-medium text-purple-600">
                                {selectedZoneData.economicActivities.services}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Scrollable Zone List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {language === 'vi' ? 'Các Vùng Kinh Tế' : 'Economic Zones'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'vi' ? 'Chọn một vùng để xem chi tiết' : 'Select a zone to view details'}
                  </p>
                </div>
                <div className="h-96 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {zones.map((zone) => (
                      <ZoneCard key={zone.id} zone={zone} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              {language === 'vi'
                ? '© 2025 Khám Phá Các Vùng Kinh Tế Việt Nam - Công cụ giáo dục'
                : '© 2025 Vietnam Economic Zones Explorer - Educational Tool'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;