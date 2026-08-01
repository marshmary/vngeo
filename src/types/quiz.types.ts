export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  allowMultipleAnswers: boolean;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  timeLimit?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  questionCount: number;
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface QuestionFormData {
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
  allowMultipleAnswers: boolean;
}
