import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';
import { Button, Input, Textarea, Select, Badge, Spinner } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

const QuizManager: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);

  const loadQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedQuizzes = await QuizService.getAllQuizzes();
      setQuizzes(loadedQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      alert(t('admin.quiz.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleCreateQuiz = () => {
    if (newQuiz.title && newQuiz.description) {
      setShowCreateConfirmModal(true);
    }
  };

  const confirmCreateQuiz = async () => {
    try {
      const quiz = await QuizService.createQuiz(
        newQuiz.title,
        newQuiz.description,
        newQuiz.difficulty
      );
      setQuizzes([quiz, ...quizzes]);
      setNewQuiz({ title: '', description: '', difficulty: 'easy' });
      setShowCreateForm(false);
      setShowCreateConfirmModal(false);

      // Navigate to edit page
      navigate(`/admin/quiz/${quiz.id}/edit`);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert(t('admin.quiz.errors.createFailed'));
      setShowCreateConfirmModal(false);
    }
  };

  const cancelCreateQuiz = () => {
    setShowCreateConfirmModal(false);
  };

  const handleEditQuiz = (quizId: string) => {
    // Navigate to quiz editor
    navigate(`/admin/quiz/${quizId}/edit`);
  };

  const handleTakeQuiz = (quizId: string) => {
    // Navigate to quiz page
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (quizToDelete) {
      try {
        await QuizService.deleteQuiz(quizToDelete.id);
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));
        setShowDeleteModal(false);
        setQuizToDelete(null);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert(t('admin.quiz.errors.deleteFailed'));
        setShowDeleteModal(false);
      }
    }
  };

  const cancelDeleteQuiz = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  // Status/difficulty → semantic badge tones (replaces the old 100+800 color
  // maps; see MIGRATION-CONTRACT.md status-color swap map).
  const getStatusTone = (status: string): BadgeTone => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'neutral';
      default: return 'neutral';
    }
  };

  const getDifficultyTone = (difficulty: string): BadgeTone => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('admin.quiz.title')}</h2>
          <p className="text-muted-foreground">{t('admin.quiz.description')}</p>
        </div>
        <Button
          variant="primary"
          data-testid="create-quiz-button"
          onClick={() => setShowCreateForm(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('admin.quiz.createQuiz')}
        </Button>
      </div>

      {/* Create Quiz Form */}
      {showCreateForm && (
        <div className="bg-card rounded-card shadow-card border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin.quiz.createNewQuiz')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('admin.quiz.quizTitle')}</label>
              <Input
                type="text"
                data-testid="new-quiz-title-input"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                placeholder={t('admin.quiz.enterQuizTitle')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('admin.quiz.description')}</label>
              <Textarea
                data-testid="new-quiz-description-input"
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                rows={3}
                placeholder={t('admin.quiz.enterQuizDescription')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('admin.quiz.difficulty')}</label>
              <Select
                data-testid="new-quiz-difficulty-select"
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              >
                <option value="easy">{t('admin.quiz.easy')}</option>
                <option value="medium">{t('admin.quiz.medium')}</option>
                <option value="hard">{t('admin.quiz.hard')}</option>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                data-testid="submit-create-quiz-button"
                onClick={handleCreateQuiz}
                disabled={!newQuiz.title || !newQuiz.description}
              >
                {t('admin.quiz.createQuiz')}
              </Button>
              <Button
                variant="secondary"
                data-testid="cancel-create-quiz-button"
                onClick={() => setShowCreateForm(false)}
              >
                {t('admin.quiz.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">{t('admin.quiz.allQuizzes')} ({quizzes.length})</h3>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <Spinner className="h-12 w-12 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('admin.quiz.loadingQuizzes')}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {t('admin.quiz.noQuizzes')}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {quizzes.map((quiz) => (
            <div key={quiz.id} data-testid={`quiz-row-${quiz.id}`} className="p-6 hover:bg-muted transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-foreground">{quiz.title}</h4>
                    <div className="flex items-center gap-1">
                      <Badge
                        tone={getStatusTone(quiz.status)}
                        data-testid={`quiz-status-${quiz.id}`}
                        className="cursor-help"
                        title={t(`admin.quiz.statusDescriptions.${quiz.status}`)}
                      >
                        {t(`admin.quiz.status.${quiz.status}`)}
                      </Badge>
                      <svg
                        className="w-3 h-3 text-faint-foreground cursor-help"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <Badge tone={getDifficultyTone(quiz.difficulty)}>
                      {t(`admin.quiz.${quiz.difficulty}`)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t('admin.quiz.created')}: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>{t('admin.quiz.updated')}: {new Date(quiz.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTakeQuiz(quiz.id)}
                    className="px-4 py-2 bg-success text-white rounded-button hover:opacity-90 transition-colors text-sm font-medium"
                    title={t('admin.quiz.takeQuiz')}
                  >
                    {t('admin.quiz.takeQuiz')}
                  </button>
                  <button
                    data-testid={`quiz-edit-button-${quiz.id}`}
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="p-2 text-brand hover:bg-brand-subtle rounded-button transition-colors"
                    title={t('admin.quiz.editQuiz')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    data-testid={`quiz-delete-button-${quiz.id}`}
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-2 text-danger hover:bg-danger-soft rounded-button transition-colors"
                    title={t('admin.quiz.deleteQuiz')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteQuiz}
        onConfirm={confirmDeleteQuiz}
        title={t('admin.quiz.deleteConfirmTitle')}
        message={t('admin.quiz.deleteConfirmMessage', { title: quizToDelete?.title })}
        confirmText={t('admin.quiz.delete')}
        cancelText={t('admin.quiz.cancel')}
        type="danger"
        confirmTestId="confirm-delete-button"
        cancelTestId="cancel-delete-button"
      />

      {/* Create Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCreateConfirmModal}
        onClose={cancelCreateQuiz}
        onConfirm={confirmCreateQuiz}
        title={t('admin.quiz.createConfirmTitle')}
        message={t('admin.quiz.createConfirmMessage', { title: newQuiz.title })}
        confirmText={t('admin.quiz.create')}
        cancelText={t('admin.quiz.cancel')}
        type="info"
        confirmTestId="confirm-create-button"
        cancelTestId="cancel-create-button"
      />
    </div>
  );
};

export default QuizManager;
