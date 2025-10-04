import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in minutes
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Mock quiz data - in real app, this would come from API
  const mockQuiz: Quiz = {
    id: '1',
    title: 'Vietnam Economic Zones Knowledge Test',
    description: 'Test your understanding of Vietnam\'s economic zones, their characteristics, and regional development.',
    difficulty: 'medium',
    timeLimit: 15,
    questions: [
      {
        id: '1',
        question: 'Which economic zone in Vietnam has the highest GDP?',
        options: [
          'Northern Mountains and Midlands',
          'Red River Delta',
          'North Central and Central Coast',
          'Central Highlands',
          'Southeast',
          'Mekong River Delta'
        ],
        correctAnswer: 4,
        explanation: 'The Southeast region, which includes Ho Chi Minh City, has the highest GDP among Vietnam\'s economic zones.'
      },
      {
        id: '2',
        question: 'What is the main economic activity in the Mekong River Delta?',
        options: [
          'Mining',
          'Manufacturing',
          'Agriculture',
          'Tourism',
          'Technology',
          'Finance'
        ],
        correctAnswer: 2,
        explanation: 'The Mekong River Delta is primarily known for agriculture, particularly rice production, which is Vietnam\'s main agricultural region.'
      },
      {
        id: '3',
        question: 'Which city is the economic center of the Red River Delta?',
        options: [
          'Hai Phong',
          'Hanoi',
          'Nam Dinh',
          'Thai Binh',
          'Hai Duong',
          'Hung Yen'
        ],
        correctAnswer: 1,
        explanation: 'Hanoi is the capital and economic center of the Red River Delta region.'
      },
      {
        id: '4',
        question: 'How many economic zones does Vietnam officially recognize?',
        options: [
          '4',
          '5',
          '6',
          '7',
          '8',
          '9'
        ],
        correctAnswer: 2,
        explanation: 'Vietnam officially recognizes 6 economic zones: Northern Mountains and Midlands, Red River Delta, North Central and Central Coast, Central Highlands, Southeast, and Mekong River Delta.'
      },
      {
        id: '5',
        question: 'Which economic zone is known for its mountainous terrain and ethnic diversity?',
        options: [
          'Red River Delta',
          'North Central and Central Coast',
          'Central Highlands',
          'Northern Mountains and Midlands',
          'Southeast',
          'Mekong River Delta'
        ],
        correctAnswer: 3,
        explanation: 'The Northern Mountains and Midlands region is characterized by mountainous terrain and is home to many ethnic minority groups.'
      }
    ]
  };

  useEffect(() => {
    // In real app, fetch quiz data based on quizId
    setQuiz(mockQuiz);
    setSelectedAnswers(new Array(mockQuiz.questions.length).fill(-1));
    
    if (mockQuiz.timeLimit) {
      setTimeLeft(mockQuiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
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

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz!.questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
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
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
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
                {isPassing ? 'Congratulations!' : 'Keep Learning!'}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                You scored {score} out of {quiz.questions.length} questions ({percentage}%)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{score}</div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{quiz.questions.length - score}</div>
                  <div className="text-sm text-gray-600">Incorrect Answers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Back to Map
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
                    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Retake Quiz
                </button>
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
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={selectedAnswers[currentQuestionIndex] === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
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
