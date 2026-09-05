import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUIStore } from '@/stores/uiStore';
import { QuizService, QuizDraftService } from '@/services/quizService';
import type { Quiz, QuizQuestion, QuizOption } from '@/types/quiz.types';
import { Button, Input, Textarea, Select, Badge, Spinner } from '@/components/ui';

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

  const loadQuiz = useCallback(async () => {
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
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

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
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Draft Prompt Modal */}
        {showDraftPrompt && (
          <div data-testid="draft-prompt" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-card shadow-overlay p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {language === 'vi' ? 'Bản nháp chưa lưu' : 'Unsaved Draft Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'vi'
                  ? 'Phát hiện bản nháp chưa lưu cho bài kiểm tra này. Bạn có muốn tiếp tục chỉnh sửa bản nháp không?'
                  : 'An unsaved draft was found for this quiz. Would you like to continue editing the draft?'}
              </p>
              <div className="flex gap-3">
                <Button
                  data-testid="load-draft-button"
                  onClick={loadDraft}
                  className="flex-1"
                >
                  {language === 'vi' ? 'Tải bản nháp' : 'Load Draft'}
                </Button>
                <Button
                  variant="secondary"
                  data-testid="discard-draft-button"
                  onClick={discardDraft}
                  className="flex-1"
                >
                  {language === 'vi' ? 'Bỏ qua' : 'Discard'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-card rounded-card shadow-card p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'vi' ? 'Chỉnh Sửa Bài Kiểm Tra' : 'Edit Quiz'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'vi' ? 'Quản lý câu hỏi và câu trả lời' : 'Manage questions and answers'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/admin')}
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button
                data-testid="save-quiz-button"
                onClick={handleSaveQuiz}
                disabled={isSaving || !quizTitle || questions.length === 0}
                className="px-6 py-2"
              >
                {isSaving ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu' : 'Save')}
              </Button>
            </div>
          </div>

          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'vi' ? 'Tiêu đề' : 'Title'}
              </label>
              <Input
                type="text"
                data-testid="quiz-title-input"
                value={quizTitle}
                onChange={(e) => {
                  setQuizTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder={language === 'vi' ? 'Nhập tiêu đề bài kiểm tra' : 'Enter quiz title'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'vi' ? 'Độ khó' : 'Difficulty'}
              </label>
              <Select
                data-testid="quiz-difficulty-select"
                value={quizDifficulty}
                onChange={(e) => {
                  setQuizDifficulty(e.target.value as 'easy' | 'medium' | 'hard');
                  setHasUnsavedChanges(true);
                }}
              >
                <option value="easy">{language === 'vi' ? 'Dễ' : 'Easy'}</option>
                <option value="medium">{language === 'vi' ? 'Trung bình' : 'Medium'}</option>
                <option value="hard">{language === 'vi' ? 'Khó' : 'Hard'}</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'vi' ? 'Trạng thái' : 'Status'}
              </label>
              <Select
                data-testid="quiz-status-select"
                value={quizStatus}
                onChange={(e) => {
                  setQuizStatus(e.target.value as 'draft' | 'published' | 'archived');
                  setHasUnsavedChanges(true);
                }}
              >
                <option value="draft">{language === 'vi' ? 'Bản nháp' : 'Draft'}</option>
                <option value="published">{language === 'vi' ? 'Đã công bố' : 'Published'}</option>
                <option value="archived">{language === 'vi' ? 'Đã lưu trữ' : 'Archived'}</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'vi' ? 'Mô tả' : 'Description'}
              </label>
              <Textarea
                data-testid="quiz-description-input"
                value={quizDescription}
                onChange={(e) => {
                  setQuizDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                rows={3}
                placeholder={language === 'vi' ? 'Nhập mô tả bài kiểm tra' : 'Enter quiz description'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'vi' ? 'Giới hạn thời gian (phút)' : 'Time Limit (minutes)'}
              </label>
              <Input
                type="number"
                value={quizTimeLimit || ''}
                onChange={(e) => {
                  setQuizTimeLimit(e.target.value ? parseInt(e.target.value) : undefined);
                  setHasUnsavedChanges(true);
                }}
                placeholder={language === 'vi' ? 'Không giới hạn' : 'No limit'}
                min={1}
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-card rounded-card shadow-card p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'vi' ? 'Câu Hỏi' : 'Questions'} ({questions.length})
            </h2>
            <Button
              data-testid="add-question-button"
              onClick={handleAddQuestion}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {language === 'vi' ? 'Thêm Câu Hỏi' : 'Add Question'}
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <svg className="w-16 h-16 mx-auto mb-4 text-faint-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{language === 'vi' ? 'Chưa có câu hỏi nào. Nhấn "Thêm Câu Hỏi" để bắt đầu.' : 'No questions yet. Click "Add Question" to start.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} data-testid={`question-row-${index}`} className="border border-border rounded-card p-4 hover:border-brand transition-colors">
                  {editingQuestionId === question.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'vi' ? 'Câu hỏi' : 'Question'}
                        </label>
                        <Textarea
                          data-testid={`question-text-input-${index}`}
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          rows={2}
                          placeholder={language === 'vi' ? 'Nhập câu hỏi' : 'Enter question'}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-foreground">
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
                              className="rounded border-border text-brand focus:ring-brand"
                            />
                            {language === 'vi' ? 'Nhiều đáp án đúng' : 'Multiple correct answers'}
                          </label>
                        </div>

                        <div className="space-y-2">
                          {currentOptions.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <input
                                type={allowMultipleAnswers ? 'checkbox' : 'radio'}
                                data-testid={`correct-option-radio-${index}-${optIndex}`}
                                checked={option.isCorrect}
                                onChange={(e) => handleUpdateOption(optIndex, 'isCorrect', e.target.checked)}
                                className="rounded border-border text-brand focus:ring-brand"
                              />
                              <Input
                                type="text"
                                data-testid={`option-text-input-${index}-${optIndex}`}
                                value={option.text}
                                onChange={(e) => handleUpdateOption(optIndex, 'text', e.target.value)}
                                placeholder={`${language === 'vi' ? 'Đáp án' : 'Answer'} ${optIndex + 1}`}
                                className="flex-1"
                              />
                              <button
                                data-testid={`delete-option-button-${index}-${optIndex}`}
                                onClick={() => handleDeleteOption(optIndex)}
                                className="p-2 text-danger hover:bg-danger-soft rounded-button transition-colors"
                                disabled={currentOptions.length <= 2}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            data-testid={`add-option-button-${index}`}
                            onClick={handleAddOption}
                            className="text-sm text-brand hover:text-brand-hover flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {language === 'vi' ? 'Thêm đáp án' : 'Add answer'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'vi' ? 'Giải thích (tùy chọn)' : 'Explanation (optional)'}
                        </label>
                        <Textarea
                          value={currentExplanation}
                          onChange={(e) => setCurrentExplanation(e.target.value)}
                          rows={2}
                          placeholder={language === 'vi' ? 'Nhập giải thích cho đáp án' : 'Enter explanation for the answer'}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          data-testid={`save-question-button-${index}`}
                          onClick={handleSaveQuestion}
                          disabled={!currentQuestion || currentOptions.length < 2 || !currentOptions.some(opt => opt.isCorrect)}
                        >
                          {language === 'vi' ? 'Lưu' : 'Save'}
                        </Button>
                        <Button
                          variant="secondary"
                          data-testid={`cancel-question-edit-button-${index}`}
                          onClick={handleCancelEdit}
                        >
                          {language === 'vi' ? 'Hủy' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">#{index + 1}</span>
                            {question.allowMultipleAnswers && (
                              <Badge tone="info">
                                {language === 'vi' ? 'Nhiều đáp án' : 'Multiple'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-foreground font-medium mb-3">{question.question || <span className="text-faint-foreground italic">{language === 'vi' ? 'Câu hỏi trống' : 'Empty question'}</span>}</p>
                          <div className="space-y-1">
                            {question.options.map((option) => (
                              <div key={option.id} className={`text-sm ${option.isCorrect ? 'text-success-strong font-medium' : 'text-muted-foreground'}`}>
                                {option.isCorrect ? '✓ ' : '○ '}{option.text || <span className="text-faint-foreground italic">{language === 'vi' ? 'Đáp án trống' : 'Empty answer'}</span>}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {language === 'vi' ? 'Giải thích: ' : 'Explanation: '}{question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            data-testid={`move-question-up-button-${index}`}
                            onClick={() => handleMoveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Di chuyển lên' : 'Move up'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            data-testid={`move-question-down-button-${index}`}
                            onClick={() => handleMoveQuestion(index, 'down')}
                            disabled={index === questions.length - 1}
                            className="p-1 text-muted-foreground hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Di chuyển xuống' : 'Move down'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            data-testid={`edit-question-button-${index}`}
                            onClick={() => handleEditQuestion(question)}
                            className="p-1 text-brand hover:bg-brand-subtle rounded"
                            title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            data-testid={`remove-question-button-${index}`}
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1 text-danger hover:bg-danger-soft rounded"
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
