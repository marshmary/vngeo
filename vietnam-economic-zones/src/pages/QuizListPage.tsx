import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';
import { useUIStore } from '@/stores/uiStore';

const QuizListPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUIStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      // Fetch only published quizzes for public viewing
      const publishedQuizzes = await QuizService.getPublishedQuizzes();
      setQuizzes(publishedQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuizzes = filterDifficulty === 'all'
    ? quizzes
    : quizzes.filter(quiz => quiz.difficulty === filterDifficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'vi' ? 'Bài Kiểm Tra' : 'Quizzes'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'vi'
              ? 'Kiểm tra kiến thức của bạn về các vùng kinh tế Việt Nam'
              : 'Test your knowledge about Vietnam Economic Zones'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {language === 'vi' ? 'Độ khó:' : 'Difficulty:'}
          </span>
          <div className="flex gap-2">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterDifficulty === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {diff === 'all'
                  ? (language === 'vi' ? 'Tất cả' : 'All')
                  : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {language === 'vi' ? 'Không có bài kiểm tra nào' : 'No quizzes available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                {/* Card Header with Gradient */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex items-end">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    {quiz.timeLimit && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                        {quiz.timeLimit} {language === 'vi' ? 'phút' : 'min'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button className="text-indigo-600 font-medium text-sm group-hover:text-indigo-700 flex items-center gap-1">
                      {language === 'vi' ? 'Bắt đầu' : 'Start'}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
