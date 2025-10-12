import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizService } from '@/services/quizService';
import type { Quiz } from '@/types/quiz.types';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string[] }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const loadQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedQuiz = await QuizService.getQuizById(quizId!);

      // Check if quiz is published (or user is admin/owner)
      if (loadedQuiz.status !== 'published' && user?.role !== 'admin') {
        setError(language === 'vi'
          ? 'Bài kiểm tra này chưa được công bố'
          : 'This quiz is not published yet');
        return;
      }

      if (loadedQuiz.questions.length === 0) {
        setError(language === 'vi'
          ? 'Bài kiểm tra này chưa có câu hỏi nào'
          : 'This quiz has no questions yet');
        return;
      }

      setQuiz(loadedQuiz);

      if (loadedQuiz.timeLimit) {
        setTimeLeft(loadedQuiz.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setError(language === 'vi'
        ? 'Không thể tải bài kiểm tra'
        : 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  }, [quizId, user?.role, language]);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, loadQuiz]);

  const handleSubmitQuiz = useCallback(() => {
    if (!quiz) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      const userAnswers = selectedAnswers[question.id] || [];
      const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);

      // Check if arrays match (same length and same elements)
      const isCorrect =
        userAnswers.length === correctOptions.length &&
        userAnswers.every(ans => correctOptions.includes(ans));

      if (isCorrect) {
        correctAnswers++;
      }
    });

    setScore(correctAnswers);
    setShowResults(true);
  }, [quiz, selectedAnswers]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, handleSubmitQuiz]);

  const handleAnswerSelect = (optionId: string) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (currentQuestion.allowMultipleAnswers) {
      // Multiple selection - toggle option
      const currentSelections = selectedAnswers[currentQuestion.id] || [];
      const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter(id => id !== optionId)
        : [...currentSelections, optionId];
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: newSelections });
    } else {
      // Single selection
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: [optionId] });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'vi' ? 'Đang tải...' : 'Loading quiz...'}</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-md mx-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'vi' ? 'Lỗi' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-6">{error || (language === 'vi' ? 'Không thể tải bài kiểm tra' : 'Failed to load quiz')}</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {language === 'vi' ? 'Quay lại danh sách' : 'Back to Quiz List'}
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isPassing ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-12 h-12 ${isPassing ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isPassing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>

              <h1 className={`text-3xl font-bold mb-4 ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                {isPassing
                  ? (language === 'vi' ? 'Chúc mừng!' : 'Congratulations!')
                  : (language === 'vi' ? 'Tiếp tục học hỏi!' : 'Keep Learning!')}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {language === 'vi'
                  ? `Bạn trả lời đúng ${score} / ${quiz.questions.length} câu hỏi (${percentage}%)`
                  : `You scored ${score} out of ${quiz.questions.length} questions (${percentage}%)`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">{language === 'vi' ? 'Đúng' : 'Correct'}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{quiz.questions.length - score}</div>
                  <div className="text-sm text-gray-600">{language === 'vi' ? 'Sai' : 'Incorrect'}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">{language === 'vi' ? 'Điểm số' : 'Score'}</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {language === 'vi' ? 'Quay lại danh sách' : 'Back to Quizzes'}
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {language === 'vi' ? 'Làm lại' : 'Retake Quiz'}
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'vi' ? 'Chi tiết kết quả' : 'Detailed Results'}
              </h2>

              <div className="space-y-6">
                {quiz.questions.map((question, qIndex) => {
                  const userAnswers = selectedAnswers[question.id] || [];
                  const correctOptions = question.options.filter(opt => opt.isCorrect);
                  const correctOptionIds = correctOptions.map(opt => opt.id);

                  const isCorrect =
                    userAnswers.length === correctOptionIds.length &&
                    userAnswers.every(ans => correctOptionIds.includes(ans));

                  return (
                    <div
                      key={question.id}
                      className={`border-2 rounded-lg p-6 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isCorrect ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {language === 'vi' ? 'Câu' : 'Question'} {qIndex + 1}: {question.question}
                          </h3>
                          {question.allowMultipleAnswers && (
                            <p className="text-sm text-gray-600 mb-2">
                              {language === 'vi' ? '(Nhiều đáp án đúng)' : '(Multiple correct answers)'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => {
                          const isUserAnswer = userAnswers.includes(option.id);
                          const isCorrectOption = option.isCorrect;

                          let optionStyle = 'bg-white border-gray-200';
                          if (isCorrectOption) {
                            optionStyle = 'bg-green-100 border-green-400';
                          } else if (isUserAnswer && !isCorrectOption) {
                            optionStyle = 'bg-red-100 border-red-400';
                          }

                          return (
                            <div
                              key={option.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${optionStyle}`}
                            >
                              {isCorrectOption && (
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span className={`flex-1 ${isCorrectOption ? 'font-medium text-green-900' : 'text-gray-700'}`}>
                                {option.text}
                              </span>
                              {isUserAnswer && (
                                <span className="text-xs font-medium text-gray-600">
                                  {language === 'vi' ? 'Bạn chọn' : 'Your answer'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            {language === 'vi' ? 'Giải thích:' : 'Explanation:'}
                          </p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                <p className="text-gray-600">{quiz.description}</p>
              </div>
              {timeLeft !== null && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold">
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.allowMultipleAnswers && (
                <p className="text-sm text-indigo-600 font-medium mb-4">
                  {language === 'vi' ? '📌 Có thể chọn nhiều đáp án' : '📌 Multiple answers allowed'}
                </p>
              )}
              {currentQuestion.options.map((option) => {
                const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(option.id);
                const inputType = currentQuestion.allowMultipleAnswers ? 'checkbox' : 'radio';

                return (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type={inputType}
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(option.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 ${currentQuestion.allowMultipleAnswers ? 'rounded' : 'rounded-full'} border-2 mr-4 flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        currentQuestion.allowMultipleAnswers ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )
                      )}
                    </div>
                    <span className="text-gray-900">{option.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
