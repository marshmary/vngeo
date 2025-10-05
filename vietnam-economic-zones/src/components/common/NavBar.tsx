import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import { useUIStore } from '@/stores/uiStore';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showQuizDropdown, setShowQuizDropdown] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Load published quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowQuizDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true);
      // Fetch only published quizzes for public navigation
      const publishedQuizzes = await QuizService.getPublishedQuizzes();
      setQuizzes(publishedQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
    setShowQuizDropdown(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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

            {/* Quiz Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className={`nav-tab ${location.pathname.startsWith('/quiz') ? 'active' : ''} flex items-center gap-1`}
                onClick={() => setShowQuizDropdown(!showQuizDropdown)}
              >
                {language === 'vi' ? 'KIỂM TRA' : 'QUIZ'}
                <svg
                  className={`w-4 h-4 transition-transform ${showQuizDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showQuizDropdown && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                  {isLoadingQuizzes ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
                    </div>
                  ) : quizzes.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm">{language === 'vi' ? 'Không có bài kiểm tra nào' : 'No quizzes available'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {language === 'vi' ? 'Chọn bài kiểm tra' : 'Select a Quiz'}
                        </p>
                      </div>
                      {quizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          onClick={() => handleQuizClick(quiz.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                                {quiz.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {quiz.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                                  {quiz.difficulty}
                                </span>
                                {quiz.timeLimit && (
                                  <span className="text-xs text-gray-500">
                                    {quiz.timeLimit} {language === 'vi' ? 'phút' : 'min'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}

                      {/* Browse All Button */}
                      <button
                        onClick={() => {
                          navigate('/quizzes');
                          setShowQuizDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-colors mt-2"
                      >
                        {language === 'vi' ? 'Xem tất cả bài kiểm tra' : 'Browse All Quizzes'} →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
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
