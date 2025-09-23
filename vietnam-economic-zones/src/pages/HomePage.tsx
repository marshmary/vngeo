import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMapContainer from '@/components/map/InteractiveMapContainer';
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
  const navigate = useNavigate();

  const selectedZoneData = selectedZone ? getZoneById(selectedZone) : null;

  useEffect(() => {
    // Load zones on component mount
    if (zones.length === 0) {
      loadZones();
    }
  }, [loadZones, zones.length]);

  // Update page title based on selected zone
  useEffect(() => {
    if (selectedZoneData) {
      document.title = `${language === 'vi' ? selectedZoneData.nameVi : selectedZoneData.name} - Viet Nam Economic Zone`;
    } else {
      document.title = 'Viet Nam Economic Zone';
    }
  }, [selectedZoneData, language]);


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
    <div className="main-container">
      {/* Header with Logo and Navigation */}
      <header className="navigation-header">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">VN</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'vi' ? 'Vùng Kinh Tế Việt Nam' : 'Vietnam Economic Zones'}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            <button className="nav-tab active">
              {language === 'vi' ? 'BẢN ĐỒ' : 'MAP'}
            </button>
            <button
              className="nav-tab"
              onClick={() => navigate('/documents')}
            >
              {language === 'vi' ? 'TÀI LIỆU' : 'DOCUMENTS'}
            </button>
          </nav>

          {/* Language Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => useUIStore.getState().setLanguage('vi')}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                language === 'vi'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VI
            </button>
            <button
              onClick={() => useUIStore.getState().setLanguage('en')}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                language === 'en'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner
              size="lg"
              message={language === 'vi' ? 'Đang tải bản đồ...' : 'Loading map...'}
            />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Map Container - Main Area */}
            <div className="flex-1">
              <div className="map-container-modern">
                <InteractiveMapContainer />
              </div>
            </div>

            {/* Information Sidebar - Hidden on mobile, visible from iPad Pro up */}
            <div className="info-panel hidden xl:block">
              {selectedZoneData ? (
                <>
                  {/* Close Button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Zone Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedZoneData.name}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      {language === 'vi' ? selectedZoneData.nameVi : selectedZoneData.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {selectedZoneData.region}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {language === 'vi' ? selectedZoneData.descriptionVi : selectedZoneData.description}
                    </p>

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
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {language === 'vi' ? 'Thống Kê Chính' : 'Key Statistics'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Population */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-800 font-medium mb-1">
                          {language === 'vi' ? 'Dân số' : 'Population'}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {(selectedZoneData.population / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      {/* GDP */}
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-xs text-green-800 font-medium mb-1">GDP</div>
                        <div className="text-lg font-bold text-green-600">
                          ${(selectedZoneData.gdp / 1000000000).toFixed(1)}B
                        </div>
                      </div>

                      {/* Area */}
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <div className="text-xs text-purple-800 font-medium mb-1">
                          {language === 'vi' ? 'Diện tích' : 'Area'}
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          {selectedZoneData.area.toLocaleString()} km²
                        </div>
                      </div>

                      {/* Established */}
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <div className="text-xs text-orange-800 font-medium mb-1">
                          {language === 'vi' ? 'Thành lập' : 'Established'}
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {selectedZoneData.establishedYear}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Industries */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {language === 'vi' ? 'Ngành Công Nghiệp' : 'Industries'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedZoneData.industries.map((industry) => (
                        <span
                          key={industry}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>


                  {/* Economic Structure */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {language === 'vi' ? 'Cơ Cấu Kinh Tế' : 'Economic Structure'}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'vi' ? 'Nông nghiệp' : 'Agriculture'}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {selectedZoneData.economicActivities.agriculture}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'vi' ? 'Công nghiệp' : 'Industry'}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {selectedZoneData.economicActivities.industry}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'vi' ? 'Dịch vụ' : 'Services'}
                        </span>
                        <span className="text-sm font-semibold text-purple-600">
                          {selectedZoneData.economicActivities.services}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'vi' ? 'Chọn một vùng kinh tế' : 'Select an Economic Zone'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'vi'
                      ? 'Nhấp vào các vùng màu trên bản đồ để xem thông tin chi tiết'
                      : 'Click on colored regions on the map to view detailed information'
                    }
                  </p>

                  {/* Quick Zone List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {language === 'vi' ? 'Tất cả vùng kinh tế:' : 'All Economic Zones:'}
                    </h4>
                    {zones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: zone.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {language === 'vi' ? zone.nameVi : zone.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;