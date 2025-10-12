import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.quiz.title')}</h2>
          <p className="text-gray-600">{t('admin.quiz.description')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('admin.quiz.createQuiz')}
        </button>
      </div>

      {/* Create Quiz Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin.quiz.createNewQuiz')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.quiz.quizTitle')}</label>
              <input
                type="text"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('admin.quiz.enterQuizTitle')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.quiz.description')}</label>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder={t('admin.quiz.enterQuizDescription')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.quiz.difficulty')}</label>
              <select
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="easy">{t('admin.quiz.easy')}</option>
                <option value="medium">{t('admin.quiz.medium')}</option>
                <option value="hard">{t('admin.quiz.hard')}</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateQuiz}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t('admin.quiz.createQuiz')}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t('admin.quiz.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{t('admin.quiz.allQuizzes')} ({quizzes.length})</h3>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('admin.quiz.loadingQuizzes')}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('admin.quiz.noQuizzes')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)} cursor-help`}
                        title={t(`admin.quiz.statusDescriptions.${quiz.status}`)}
                      >
                        {t(`admin.quiz.status.${quiz.status}`)}
                      </span>
                      <svg
                        className="w-3 h-3 text-gray-400 cursor-help"
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {t(`admin.quiz.${quiz.difficulty}`)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{t('admin.quiz.created')}: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>{t('admin.quiz.updated')}: {new Date(quiz.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTakeQuiz(quiz.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    title={t('admin.quiz.takeQuiz')}
                  >
                    {t('admin.quiz.takeQuiz')}
                  </button>
                  <button
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={t('admin.quiz.editQuiz')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      />
    </div>
  );
};

export default QuizManager;
