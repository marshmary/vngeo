import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';
import { Badge, Pagination, Spinner } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

const QuizListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

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

  // Difficulty → semantic badge tone. Replaces the old green/yellow/red/gray
  // 100+800 color map (see MIGRATION-CONTRACT.md status-color swap map).
  const difficultyTone = (difficulty: string): BadgeTone => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'neutral';
    }
  };

  const filteredQuizzes = filterDifficulty === 'all'
    ? quizzes
    : quizzes.filter(quiz => quiz.difficulty === filterDifficulty);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDifficulty]);

  return (
    <div data-testid="quiz-list-page" className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('quizList.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('quizList.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {t('quizList.difficulty')}
          </span>
          <div className="flex gap-2">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
                  filterDifficulty === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                {t(`quizList.${diff}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="h-12 w-12 mb-4" />
            <p className="text-muted-foreground">{t('quizList.loading')}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-card rounded-card shadow-card border border-border p-12 text-center">
            <svg className="w-16 h-16 text-faint-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground text-lg">
              {t('quizList.noQuizzes')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  data-testid="quiz-card"
                  data-quiz-id={quiz.id}
                  className="bg-card rounded-card shadow-card border border-border hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                  {/* Card Header with Gradient */}
                  <div className="h-32 bg-gradient-to-br from-accent-from to-accent-to p-6 flex items-end">
                    <div className="flex items-center gap-2">
                      <Badge tone={difficultyTone(quiz.difficulty)} className="px-3 py-1">
                        {t(`quizList.${quiz.difficulty}`)}
                      </Badge>
                      {quiz.timeLimit && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                          {quiz.timeLimit} {t('quizList.minutes')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-end pt-4 border-t border-border">
                      <button className="text-brand font-medium text-sm group-hover:text-brand-hover flex items-center gap-1">
                        {t('quizList.start')}
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                previousPageLabel={t('quizList.previousPage')}
                nextPageLabel={t('quizList.nextPage')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
