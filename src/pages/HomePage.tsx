import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InteractiveMapContainer from '@/components/map/InteractiveMapContainer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui';
import FirstTimeGuide from '@/components/guide/FirstTimeGuide';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
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
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-card shadow-card max-w-md">
          <div className="text-danger mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error Loading Application
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="primary" onClick={loadZones}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* First Time Guide */}
      <FirstTimeGuide />

      {/* Main Content */}
      <main className="h-full flex">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <LoadingSpinner
              size="lg"
              message={language === 'vi' ? 'Đang tải bản đồ...' : 'Loading map...'}
            />
          </div>
        ) : (
          <>
            {/* Map Container - Main Area */}
            <div className="flex-1 relative">
              <InteractiveMapContainer />
            </div>

            {/* Information Sidebar - Hidden on mobile, visible from iPad Pro up */}
            <div data-testid="zone-details" className="hidden xl:block w-96 bg-card shadow-overlay border-l border-border overflow-y-auto p-6">
              {selectedZoneData ? (
                <>
                  {/* Close Button */}
                  <div className="flex justify-end mb-4">
                    <button
                      data-testid="zone-details-close"
                      onClick={() => setSelectedZone(null)}
                      className="text-faint-foreground hover:text-muted-foreground p-1 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Zone Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {selectedZoneData.name}
                    </h3>
                    <p className="text-muted-foreground mb-1">
                      {language === 'vi' ? selectedZoneData.nameVi : selectedZoneData.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedZoneData.region}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed mb-3">
                      {language === 'vi' ? selectedZoneData.descriptionVi : selectedZoneData.description}
                    </p>

                    {/* Zone Color Indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedZoneData.color }}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Màu vùng trên bản đồ' : 'Zone color on map'}
                      </span>
                    </div>
                  </div>

                  {/* Key Statistics */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      {language === 'vi' ? 'Thống Kê Chính' : 'Key Statistics'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Population */}
                      <div className="bg-info-soft p-3 rounded-card border border-info/30">
                        <div className="text-xs text-info-strong font-medium mb-1">
                          {language === 'vi' ? 'Dân số' : 'Population'}
                        </div>
                        <div className="text-lg font-bold text-info">
                          {(selectedZoneData.population / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      {/* GDP */}
                      <div className="bg-success-soft p-3 rounded-card border border-success/30">
                        <div className="text-xs text-success-strong font-medium mb-1">GDP</div>
                        <div className="text-lg font-bold text-success">
                          ${(selectedZoneData.gdp / 1000000000).toFixed(1)}B
                        </div>
                      </div>

                      {/* Area */}
                      <div className="bg-brand-subtle p-3 rounded-card border border-brand/30">
                        <div className="text-xs text-brand font-medium mb-1">
                          {language === 'vi' ? 'Diện tích' : 'Area'}
                        </div>
                        <div className="text-lg font-bold text-brand">
                          {selectedZoneData.area.toLocaleString()} km²
                        </div>
                      </div>

                      {/* Established */}
                      <div className="bg-warning-soft p-3 rounded-card border border-warning/30">
                        <div className="text-xs text-warning-strong font-medium mb-1">
                          {language === 'vi' ? 'Thành lập' : 'Established'}
                        </div>
                        <div className="text-lg font-bold text-warning">
                          {selectedZoneData.establishedYear}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Industries */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      {language === 'vi' ? 'Ngành Công Nghiệp' : 'Industries'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedZoneData.industries.map((industry) => (
                        <span
                          key={industry}
                          className="px-3 py-1 bg-info-soft text-info-strong text-xs rounded-full font-medium"
                        >
                          {t(`industries.${industry}`)}
                        </span>
                      ))}
                    </div>
                  </div>


                  {/* Economic Structure */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      {language === 'vi' ? 'Cơ Cấu Kinh Tế' : 'Economic Structure'}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Nông nghiệp' : 'Agriculture'}
                        </span>
                        <span className="text-sm font-semibold text-success">
                          {selectedZoneData.economicActivities.agriculture}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Công nghiệp' : 'Industry'}
                        </span>
                        <span className="text-sm font-semibold text-info">
                          {selectedZoneData.economicActivities.industry}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Dịch vụ' : 'Services'}
                        </span>
                        <span className="text-sm font-semibold text-brand">
                          {selectedZoneData.economicActivities.services}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-faint-foreground mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {language === 'vi' ? 'Chọn một vùng kinh tế' : 'Select an Economic Zone'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'vi'
                      ? 'Nhấp vào các vùng màu trên bản đồ để xem thông tin chi tiết'
                      : 'Click on colored regions on the map to view detailed information'
                    }
                  </p>

                  {/* Quick Zone List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      {language === 'vi' ? 'Tất cả vùng kinh tế:' : 'All Economic Zones:'}
                    </h4>
                    {zones.map((zone) => (
                      <button
                        key={zone.id}
                        data-testid={`zone-link-${zone.id}`}
                        onClick={() => setSelectedZone(zone.id)}
                        className="w-full text-left p-2 rounded-button hover:bg-muted border border-border transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: zone.color }}
                          ></div>
                          <span className="text-sm font-medium text-foreground">
                            {language === 'vi' ? zone.nameVi : zone.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;