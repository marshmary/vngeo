import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

const DocumentsPage: React.FC = () => {
  const { language } = useUIStore();
  const navigate = useNavigate();

  const documents = [
    {
      id: 'geography-zones',
      title: language === 'vi' ? 'Phân Vùng Địa Lý Việt Nam' : 'Vietnam Geography Zones',
      description: language === 'vi'
        ? 'Tài liệu chi tiết về các vùng địa lý tự nhiên của Việt Nam'
        : 'Detailed documents about Vietnam\'s natural geography zones',
      category: language === 'vi' ? 'Địa lý' : 'Geography',
      downloadUrl: '#',
      fileSize: '2.5 MB',
      format: 'PDF'
    },
    {
      id: 'economic-zones-overview',
      title: language === 'vi' ? 'Tổng Quan Vùng Kinh Tế' : 'Economic Zones Overview',
      description: language === 'vi'
        ? 'Báo cáo tổng quan về 6 vùng kinh tế của Việt Nam'
        : 'Comprehensive report on Vietnam\'s 6 economic zones',
      category: language === 'vi' ? 'Kinh tế' : 'Economics',
      downloadUrl: '#',
      fileSize: '4.2 MB',
      format: 'PDF'
    },
    {
      id: 'regional-development',
      title: language === 'vi' ? 'Phát Triển Vùng Miền' : 'Regional Development',
      description: language === 'vi'
        ? 'Chiến lược phát triển kinh tế - xã hội theo vùng'
        : 'Socio-economic development strategies by region',
      category: language === 'vi' ? 'Phát triển' : 'Development',
      downloadUrl: '#',
      fileSize: '3.8 MB',
      format: 'PDF'
    },
    {
      id: 'natural-resources',
      title: language === 'vi' ? 'Tài Nguyên Thiên Nhiên' : 'Natural Resources',
      description: language === 'vi'
        ? 'Phân bố tài nguyên thiên nhiên theo vùng địa lý'
        : 'Distribution of natural resources by geographical region',
      category: language === 'vi' ? 'Tài nguyên' : 'Resources',
      downloadUrl: '#',
      fileSize: '5.1 MB',
      format: 'PDF'
    },
    {
      id: 'climate-zones',
      title: language === 'vi' ? 'Vùng Khí Hậu Việt Nam' : 'Vietnam Climate Zones',
      description: language === 'vi'
        ? 'Đặc điểm khí hậu các vùng miền Việt Nam'
        : 'Climate characteristics of Vietnam\'s regions',
      category: language === 'vi' ? 'Khí hậu' : 'Climate',
      downloadUrl: '#',
      fileSize: '1.9 MB',
      format: 'PDF'
    },
    {
      id: 'population-distribution',
      title: language === 'vi' ? 'Phân Bố Dân Số' : 'Population Distribution',
      description: language === 'vi'
        ? 'Phân tích phân bố dân số theo vùng kinh tế'
        : 'Analysis of population distribution by economic zones',
      category: language === 'vi' ? 'Dân số' : 'Demographics',
      downloadUrl: '#',
      fileSize: '2.7 MB',
      format: 'PDF'
    }
  ];

  const categories = [...new Set(documents.map(doc => doc.category))];

  return (
    <div className="main-container scrollable">
      {/* Header */}
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
            <button
              className="nav-tab"
              onClick={() => navigate('/')}
            >
              {language === 'vi' ? 'BẢN ĐỒ' : 'MAP'}
            </button>
            <button className="nav-tab active">
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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'vi' ? 'Tài Liệu Vùng Địa Lý' : 'Geography Zone Documents'}
            </h1>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Tổng hợp tài liệu nghiên cứu về các vùng địa lý và kinh tế của Việt Nam'
                : 'Collection of research documents about Vietnam\'s geographical and economic zones'
              }
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                {language === 'vi' ? 'Tất cả' : 'All'}
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(document => (
              <div key={document.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
                {/* Document Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {document.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{document.format}</span>
                </div>

                {/* Document Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {document.description}
                  </p>
                </div>

                {/* Document Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{document.fileSize}</span>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{language === 'vi' ? 'Tải về' : 'Download'}</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {language === 'vi' ? 'Thông Tin Bổ Sung' : 'Additional Information'}
                </h3>
                <p className="text-blue-800">
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