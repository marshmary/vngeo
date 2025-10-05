import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { QuizService, QuizDraftService } from '@/services/quizService';
import type { Quiz, QuizQuestion, QuizOption } from '@/types/quiz.types';

const QuizEditPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { language } = useUIStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizStatus, setQuizStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Question editor states
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentOptions, setCurrentOptions] = useState<QuizOption[]>([]);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;

    setIsLoading(true);
    try {
      // Check if there's a draft in local storage
      const hasDraft = QuizDraftService.hasDraft(quizId);
      if (hasDraft) {
        setShowDraftPrompt(true);
      }

      // Load from database
      const loadedQuiz = await QuizService.getQuizById(quizId);
      setQuiz(loadedQuiz);
      setQuizTitle(loadedQuiz.title);
      setQuizDescription(loadedQuiz.description);
      setQuizDifficulty(loadedQuiz.difficulty);
      setQuizStatus(loadedQuiz.status);
      setQuizTimeLimit(loadedQuiz.timeLimit);
      setQuestions(loadedQuiz.questions);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('Failed to load quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDraft = () => {
    if (!quizId) return;

    const draft = QuizDraftService.loadDraft(quizId);
    if (draft) {
      const { quiz: draftQuiz } = draft;
      setQuiz(draftQuiz);
      setQuizTitle(draftQuiz.title);
      setQuizDescription(draftQuiz.description);
      setQuizDifficulty(draftQuiz.difficulty);
      setQuizStatus(draftQuiz.status);
      setQuizTimeLimit(draftQuiz.timeLimit);
      setQuestions(draftQuiz.questions);
      setShowDraftPrompt(false);
    }
  };

  const discardDraft = () => {
    if (quizId) {
      QuizDraftService.deleteDraft(quizId);
    }
    setShowDraftPrompt(false);
  };

  // Auto-save to local storage when quiz data changes
  useEffect(() => {
    if (!quiz || !hasUnsavedChanges) return;

    const currentQuiz: Quiz = {
      ...quiz,
      title: quizTitle,
      description: quizDescription,
      difficulty: quizDifficulty,
      status: quizStatus,
      timeLimit: quizTimeLimit,
      questions
    };

    QuizDraftService.saveDraft(quiz.id, currentQuiz);
  }, [quiz, quizTitle, quizDescription, quizDifficulty, quizStatus, quizTimeLimit, questions, hasUnsavedChanges]);

  const handleSaveQuiz = async () => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      const updatedQuiz: Quiz = {
        ...quiz,
        title: quizTitle,
        description: quizDescription,
        difficulty: quizDifficulty,
        status: quizStatus,
        timeLimit: quizTimeLimit,
        questions,
        updatedAt: new Date().toISOString()
      };

      await QuizService.saveQuiz(updatedQuiz);

      // Clear draft after successful save
      QuizDraftService.deleteDraft(quiz.id);
      setHasUnsavedChanges(false);

      alert('Quiz saved successfully!');

      // Navigate back to admin page
      navigate('/admin?section=quiz');
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false }
      ],
      explanation: '',
      allowMultipleAnswers: false,
      order: questions.length
    };

    setQuestions([...questions, newQuestion]);
    setEditingQuestionId(newQuestion.id);
    setCurrentQuestion('');
    setCurrentOptions(newQuestion.options);
    setCurrentExplanation('');
    setAllowMultipleAnswers(false);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion(question.question);
    setCurrentOptions([...question.options]);
    setCurrentExplanation(question.explanation || '');
    setAllowMultipleAnswers(question.allowMultipleAnswers);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestionId) return;

    const updatedQuestions = questions.map(q => {
      if (q.id === editingQuestionId) {
        return {
          ...q,
          question: currentQuestion,
          options: currentOptions,
          explanation: currentExplanation,
          allowMultipleAnswers
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    setEditingQuestionId(null);
    resetQuestionForm();
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setCurrentQuestion('');
    setCurrentOptions([]);
    setCurrentExplanation('');
    setAllowMultipleAnswers(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
      resetQuestionForm();
    }
  };

  const handleAddOption = () => {
    const newOption: QuizOption = {
      id: `opt-${Date.now()}`,
      text: '',
      isCorrect: false
    };
    setCurrentOptions([...currentOptions, newOption]);
  };

  const handleUpdateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updatedOptions = [...currentOptions];
    if (field === 'text') {
      updatedOptions[index].text = value as string;
    } else {
      // Handle single vs multiple answer logic
      if (!allowMultipleAnswers) {
        // For single answer, uncheck all other options
        updatedOptions.forEach((opt, i) => {
          opt.isCorrect = i === index ? (value as boolean) : false;
        });
      } else {
        updatedOptions[index].isCorrect = value as boolean;
      }
    }
    setCurrentOptions(updatedOptions);
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    setCurrentOptions(updatedOptions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= questions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

    // Update order
    newQuestions.forEach((q, i) => {
      q.order = i;
    });

    setQuestions(newQuestions);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Draft Prompt Modal */}
        {showDraftPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'vi' ? 'Bản nháp chưa lưu' : 'Unsaved Draft Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'vi'
                  ? 'Phát hiện bản nháp chưa lưu cho bài kiểm tra này. Bạn có muốn tiếp tục chỉnh sửa bản nháp không?'
                  : 'An unsaved draft was found for this quiz. Would you like to continue editing the draft?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={loadDraft}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {language === 'vi' ? 'Tải bản nháp' : 'Load Draft'}
                </button>
                <button
                  onClick={discardDraft}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {language === 'vi' ? 'Bỏ qua' : 'Discard'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'vi' ? 'Chỉnh Sửa Bài Kiểm Tra' : 'Edit Quiz'}
              </h1>
              <p className="text-gray-600">
                {language === 'vi' ? 'Quản lý câu hỏi và câu trả lời' : 'Manage questions and answers'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveQuiz}
                disabled={isSaving || !quizTitle || questions.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu' : 'Save')}
              </button>
            </div>
          </div>

          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Tiêu đề' : 'Title'}
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => {
                  setQuizTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={language === 'vi' ? 'Nhập tiêu đề bài kiểm tra' : 'Enter quiz title'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Độ khó' : 'Difficulty'}
              </label>
              <select
                value={quizDifficulty}
                onChange={(e) => {
                  setQuizDifficulty(e.target.value as 'easy' | 'medium' | 'hard');
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="easy">{language === 'vi' ? 'Dễ' : 'Easy'}</option>
                <option value="medium">{language === 'vi' ? 'Trung bình' : 'Medium'}</option>
                <option value="hard">{language === 'vi' ? 'Khó' : 'Hard'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Trạng thái' : 'Status'}
              </label>
              <select
                value={quizStatus}
                onChange={(e) => {
                  setQuizStatus(e.target.value as 'draft' | 'published' | 'archived');
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">{language === 'vi' ? 'Bản nháp' : 'Draft'}</option>
                <option value="published">{language === 'vi' ? 'Đã công bố' : 'Published'}</option>
                <option value="archived">{language === 'vi' ? 'Đã lưu trữ' : 'Archived'}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Mô tả' : 'Description'}
              </label>
              <textarea
                value={quizDescription}
                onChange={(e) => {
                  setQuizDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder={language === 'vi' ? 'Nhập mô tả bài kiểm tra' : 'Enter quiz description'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? 'Giới hạn thời gian (phút)' : 'Time Limit (minutes)'}
              </label>
              <input
                type="number"
                value={quizTimeLimit || ''}
                onChange={(e) => {
                  setQuizTimeLimit(e.target.value ? parseInt(e.target.value) : undefined);
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={language === 'vi' ? 'Không giới hạn' : 'No limit'}
                min={1}
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'vi' ? 'Câu Hỏi' : 'Questions'} ({questions.length})
            </h2>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {language === 'vi' ? 'Thêm Câu Hỏi' : 'Add Question'}
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{language === 'vi' ? 'Chưa có câu hỏi nào. Nhấn "Thêm Câu Hỏi" để bắt đầu.' : 'No questions yet. Click "Add Question" to start.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  {editingQuestionId === question.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Câu hỏi' : 'Question'}
                        </label>
                        <textarea
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                          placeholder={language === 'vi' ? 'Nhập câu hỏi' : 'Enter question'}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {language === 'vi' ? 'Đáp án' : 'Answers'}
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={allowMultipleAnswers}
                              onChange={(e) => {
                                setAllowMultipleAnswers(e.target.checked);
                                if (!e.target.checked) {
                                  // Reset to single correct answer
                                  const updatedOptions = currentOptions.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === 0 ? opt.isCorrect : false
                                  }));
                                  setCurrentOptions(updatedOptions);
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {language === 'vi' ? 'Nhiều đáp án đúng' : 'Multiple correct answers'}
                          </label>
                        </div>

                        <div className="space-y-2">
                          {currentOptions.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <input
                                type={allowMultipleAnswers ? 'checkbox' : 'radio'}
                                checked={option.isCorrect}
                                onChange={(e) => handleUpdateOption(optIndex, 'isCorrect', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleUpdateOption(optIndex, 'text', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder={`${language === 'vi' ? 'Đáp án' : 'Answer'} ${optIndex + 1}`}
                              />
                              <button
                                onClick={() => handleDeleteOption(optIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={currentOptions.length <= 2}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={handleAddOption}
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {language === 'vi' ? 'Thêm đáp án' : 'Add answer'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Giải thích (tùy chọn)' : 'Explanation (optional)'}
                        </label>
                        <textarea
                          value={currentExplanation}
                          onChange={(e) => setCurrentExplanation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                          placeholder={language === 'vi' ? 'Nhập giải thích cho đáp án' : 'Enter explanation for the answer'}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveQuestion}
                          disabled={!currentQuestion || currentOptions.length < 2 || !currentOptions.some(opt => opt.isCorrect)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {language === 'vi' ? 'Lưu' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {language === 'vi' ? 'Hủy' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">#{index + 1}</span>
                            {question.allowMultipleAnswers && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {language === 'vi' ? 'Nhiều đáp án' : 'Multiple'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 font-medium mb-3">{question.question || <span className="text-gray-400 italic">{language === 'vi' ? 'Câu hỏi trống' : 'Empty question'}</span>}</p>
                          <div className="space-y-1">
                            {question.options.map((option) => (
                              <div key={option.id} className={`text-sm ${option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                {option.isCorrect ? '✓ ' : '○ '}{option.text || <span className="text-gray-400 italic">{language === 'vi' ? 'Đáp án trống' : 'Empty answer'}</span>}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {language === 'vi' ? 'Giải thích: ' : 'Explanation: '}{question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => handleMoveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Di chuyển lên' : 'Move up'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveQuestion(index, 'down')}
                            disabled={index === questions.length - 1}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Di chuyển xuống' : 'Move down'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title={language === 'vi' ? 'Xóa' : 'Delete'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizEditPage;
