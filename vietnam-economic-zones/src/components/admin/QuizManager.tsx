import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const QuizManager: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Vietnam Economic Zones Basics',
      description: 'Test your knowledge about Vietnam\'s economic zones and their characteristics.',
      questions: 10,
      difficulty: 'easy',
      status: 'published',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'Advanced Economic Zone Analysis',
      description: 'Deep dive into economic zone data, GDP, and regional development.',
      questions: 15,
      difficulty: 'hard',
      status: 'draft',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-22'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);

  const handleCreateQuiz = () => {
    if (newQuiz.title && newQuiz.description) {
      setShowCreateConfirmModal(true);
    }
  };

  const confirmCreateQuiz = () => {
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: newQuiz.title,
      description: newQuiz.description,
      questions: 0,
      difficulty: newQuiz.difficulty,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setQuizzes([...quizzes, quiz]);
    setNewQuiz({ title: '', description: '', difficulty: 'easy' });
    setShowCreateForm(false);
    setShowCreateConfirmModal(false);
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

  const confirmDeleteQuiz = () => {
    if (quizToDelete) {
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));
      setShowDeleteModal(false);
      setQuizToDelete(null);
    }
  };

  const cancelDeleteQuiz = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleStatusChange = (quizId: string, newStatus: 'draft' | 'published' | 'archived') => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : quiz
    ));
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
          <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-600">Create and manage quizzes for Vietnam Economic Zones</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Quiz
        </button>
      </div>

      {/* Create Quiz Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Quiz</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
              <input
                type="text"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Enter quiz description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateQuiz}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Quiz
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Quizzes ({quizzes.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                      {quiz.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{quiz.questions} questions</span>
                    <span>Created: {quiz.createdAt}</span>
                    <span>Updated: {quiz.updatedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTakeQuiz(quiz.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    title="Take Quiz"
                  >
                    Take Quiz
                  </button>
                  <select
                    value={quiz.status}
                    onChange={(e) => handleStatusChange(quiz.id, e.target.value as 'draft' | 'published' | 'archived')}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Quiz"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Quiz"
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteQuiz}
        onConfirm={confirmDeleteQuiz}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Create Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCreateConfirmModal}
        onClose={cancelCreateQuiz}
        onConfirm={confirmCreateQuiz}
        title="Create Quiz"
        message={`Are you sure you want to create the quiz "${newQuiz.title}"?`}
        confirmText="Create"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default QuizManager;
