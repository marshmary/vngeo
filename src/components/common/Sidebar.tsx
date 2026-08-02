import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMap,
  faFileAlt,
  faPencilRuler,
  faClipboardQuestion,
  faComments,
  faGlobe,
  faChevronDown,
  faBars,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import { useUIStore } from '@/stores/uiStore';

// Language options
const LANGUAGES = [
  { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en' as const, label: 'English', flag: 'EN' }
];

interface SidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  // Notify parent component when collapse state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        data-testid="mobile-menu-button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[5000] lg:hidden bg-card rounded-button shadow-md p-3 hover:shadow-lg transition-shadow"
      >
        <FontAwesomeIcon icon={isMobileOpen ? faTimes : faBars} className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[4000] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="navbar"
        className={`
          fixed top-0 left-0 h-screen bg-card shadow-overlay z-[4500]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Top Section - Logo & Collapse */}
          <div className="border-b border-border">
            {/* Logo & Brand */}
            <div className={`p-6 pb-4 ${isCollapsed ? 'px-4' : ''}`}>
              <div
                data-guide="sidebar-logo"
                className={`flex items-center cursor-pointer group ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                onClick={() => handleNavClick('/')}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent-from to-accent-to rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow flex-shrink-0">
                  <span className="text-white font-bold text-lg">VN</span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base font-bold text-foreground leading-tight truncate">
                      {language === 'vi' ? 'Vùng Kinh Tế' : 'Economic Zones'}
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">
                      {language === 'vi' ? 'Việt Nam' : 'Vietnam'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Collapse Toggle - Desktop Only */}
            <div className={`px-6 pb-4 ${isCollapsed ? 'px-4' : ''}`}>
              <button
                data-guide="sidebar-collapse"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center justify-center w-full py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-button transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}
                />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium">
                    {language === 'vi' ? 'Thu gọn' : 'Collapse'}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {/* Map */}
              <button
                data-guide="nav-map"
                className={`sidebar-nav-item ${isActive('/') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => handleNavClick('/')}
                title={language === 'vi' ? 'Bản đồ' : 'Map'}
              >
                <FontAwesomeIcon icon={faMap} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{language === 'vi' ? 'Bản đồ' : 'Map'}</span>
                )}
              </button>

              {/* Documents */}
              <button
                data-guide="nav-documents"
                className={`sidebar-nav-item ${isActive('/documents') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => handleNavClick('/documents')}
                title={language === 'vi' ? 'Tài liệu' : 'Documents'}
              >
                <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{language === 'vi' ? 'Tài liệu' : 'Documents'}</span>
                )}
              </button>

              {/* Map Drawing */}
              <button
                data-guide="nav-drawing"
                className={`sidebar-nav-item ${isActive('/map-drawing') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => handleNavClick('/map-drawing')}
                title={language === 'vi' ? 'Vẽ bản đồ' : 'Map Drawing'}
              >
                <FontAwesomeIcon icon={faPencilRuler} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{language === 'vi' ? 'Vẽ bản đồ' : 'Map Drawing'}</span>
                )}
              </button>

              {/* Feedback */}
              <button
                data-guide="nav-feedback"
                className={`sidebar-nav-item ${isActive('/feedback') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => handleNavClick('/feedback')}
                title={language === 'vi' ? 'Phản hồi' : 'Feedback'}
              >
                <FontAwesomeIcon icon={faComments} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{language === 'vi' ? 'Phản hồi' : 'Feedback'}</span>
                )}
              </button>

              {/* Quiz */}
              <button
                data-guide="nav-quiz"
                className={`sidebar-nav-item ${location.pathname.startsWith('/quiz') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => handleNavClick('/quizzes')}
                title={language === 'vi' ? 'Kiểm tra' : 'Quiz'}
              >
                <FontAwesomeIcon icon={faClipboardQuestion} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{language === 'vi' ? 'Kiểm tra' : 'Quiz'}</span>
                )}
              </button>
            </div>
          </nav>

          {/* Bottom Section - Language & Profile */}
          <div className="border-t border-border p-4">
            {/* Language Dropdown */}
            <div className="relative mb-4" ref={languageDropdownRef}>
              <button
                data-testid="language-selector"
                data-guide="sidebar-language"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-button hover:bg-muted transition-all ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-muted-foreground" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-foreground">
                      {currentLanguage.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-3 h-3 text-muted-foreground transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Language Dropdown Menu */}
              {showLanguageDropdown && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-card rounded-card shadow-overlay border border-border overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      data-testid={`language-option-${lang.code}`}
                      onClick={() => {
                        useUIStore.getState().setLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors ${
                        language === lang.code ? 'bg-brand-subtle' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className={`text-sm font-medium ${
                          language === lang.code ? 'text-brand' : 'text-foreground'
                        }`}>
                          {lang.label}
                        </span>
                      </div>
                      {language === lang.code && (
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-brand" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div data-testid="user-profile-section" data-guide="sidebar-profile" className={isCollapsed ? 'flex justify-center' : ''}>
              <UserProfileDropdown isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
