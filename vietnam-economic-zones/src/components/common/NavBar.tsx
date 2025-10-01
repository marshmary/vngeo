import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import { useUIStore } from '@/stores/uiStore';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/')}>
              <span className="text-white font-bold text-lg">VN</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
                {language === 'vi' ? 'Vùng Kinh Tế Việt Nam' : 'Vietnam Economic Zones'}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            <button
              className={`nav-tab ${isActive('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              {language === 'vi' ? 'BẢN ĐỒ' : 'MAP'}
            </button>
            <button
              className={`nav-tab ${isActive('/documents') ? 'active' : ''}`}
              onClick={() => navigate('/documents')}
            >
              {language === 'vi' ? 'TÀI LIỆU' : 'DOCUMENTS'}
            </button>
          </nav>

          {/* Right Side - Language Toggle & Profile */}
          <div className="flex items-center space-x-4">
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

            {/* User Profile Dropdown */}
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
