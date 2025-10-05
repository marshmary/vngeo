import { supabase } from '@/lib/supabase';
import type { Quiz } from '@/types/quiz.types';

interface QuizRow {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  time_limit: number | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export class QuizService {
  private static cache: Map<string, { data: Quiz; timestamp: number }> = new Map();
  private static listCache: { data: Quiz[]; timestamp: number } | null = null;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all quizzes
   */
  static async getAllQuizzes(): Promise<Quiz[]> {
    // Check cache first
    if (this.listCache && Date.now() - this.listCache.timestamp < this.CACHE_DURATION) {
      console.log('[QuizService] Returning cached quiz list');
      return this.listCache.data;
    }

    console.log('[QuizService] Fetching all quizzes from database');
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[QuizService] Error fetching quizzes:', error);
      throw new Error(`Failed to fetch quizzes: ${error.message}`);
    }

    // Map quiz rows to Quiz type
    const quizzesWithCounts = (quizzes || []).map((quizRow: QuizRow) => {
      return this.mapQuizRowToQuiz(quizRow);
    });

    // Update cache
    this.listCache = { data: quizzesWithCounts, timestamp: Date.now() };

    return quizzesWithCounts;
  }

  /**
   * Get only published quizzes (for public use)
   */
  static async getPublishedQuizzes(): Promise<Quiz[]> {
    console.log('[QuizService] Fetching published quizzes from database');
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[QuizService] Error fetching published quizzes:', error);
      throw new Error(`Failed to fetch published quizzes: ${error.message}`);
    }

    // Map quiz rows to Quiz type
    const publishedQuizzes = (quizzes || []).map((quizRow: QuizRow) => {
      return this.mapQuizRowToQuiz(quizRow);
    });

    return publishedQuizzes;
  }

  /**
   * Get a single quiz by ID with all questions and options
   */
  static async getQuizById(quizId: string): Promise<Quiz> {
    // Check cache first
    const cached = this.cache.get(quizId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('[QuizService] Returning cached quiz:', quizId);
      return cached.data;
    }

    console.log('[QuizService] Fetching quiz from database:', quizId);

    // Fetch quiz
    const { data: quizRow, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) {
      console.error('[QuizService] Error fetching quiz:', quizError);
      throw new Error(`Failed to fetch quiz: ${quizError.message}`);
    }

    // Fetch questions with options in a single query
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        quiz_options (*)
      `)
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('[QuizService] Error fetching questions:', questionsError);
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);
    }

    // Map to Quiz type
    const quiz: Quiz = {
      id: quizRow.id,
      title: quizRow.title,
      description: quizRow.description,
      difficulty: quizRow.difficulty,
      status: quizRow.status,
      timeLimit: quizRow.time_limit || undefined,
      createdAt: quizRow.created_at,
      updatedAt: quizRow.updated_at,
      questions: (questions || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        explanation: q.explanation || undefined,
        allowMultipleAnswers: q.allow_multiple_answers,
        order: q.order_index,
        options: (q.quiz_options || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((o: any) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.is_correct
          }))
      }))
    };

    // Update cache
    this.cache.set(quizId, { data: quiz, timestamp: Date.now() });

    return quiz;
  }

  /**
   * Create a new quiz
   */
  static async createQuiz(title: string, description: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Quiz> {
    console.log('[QuizService] Creating new quiz');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create a quiz');
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        title,
        description,
        difficulty,
        status: 'draft',
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('[QuizService] Error creating quiz:', error);
      throw new Error(`Failed to create quiz: ${error.message}`);
    }

    // Clear list cache
    this.listCache = null;

    return this.mapQuizRowToQuiz(data);
  }

  /**
   * Update quiz metadata (title, description, difficulty, status, time limit)
   */
  static async updateQuizMetadata(
    quizId: string,
    updates: {
      title?: string;
      description?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      status?: 'draft' | 'published' | 'archived';
      timeLimit?: number;
    }
  ): Promise<void> {
    console.log('[QuizService] Updating quiz metadata:', quizId);

    // Build update object with only defined fields
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.timeLimit !== undefined) updateData.time_limit = updates.timeLimit;

    const { error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', quizId);

    if (error) {
      console.error('[QuizService] Error updating quiz:', error);
      throw new Error(`Failed to update quiz: ${error.message}`);
    }

    // Clear caches
    this.cache.delete(quizId);
    this.listCache = null;
  }

  /**
   * Save entire quiz (metadata + questions + options) in a single transaction
   */
  static async saveQuiz(quiz: Quiz): Promise<void> {
    console.log('[QuizService] Saving complete quiz:', quiz.id);

    try {
      // Step 1: Update quiz metadata
      await this.updateQuizMetadata(quiz.id, {
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        status: quiz.status,
        timeLimit: quiz.timeLimit
      });

      // Step 2: Get existing questions to determine what to delete
      const { data: existingQuestions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quiz.id);

      const existingQuestionIds = (existingQuestions || []).map(q => q.id);
      const newQuestionIds = quiz.questions.map(q => q.id).filter(id => id.startsWith('q-') === false);

      // Delete removed questions (and their options will cascade delete)
      const questionIdsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
      if (questionIdsToDelete.length > 0) {
        await supabase
          .from('quiz_questions')
          .delete()
          .in('id', questionIdsToDelete);
      }

      // Step 3: Upsert questions and options
      for (const question of quiz.questions) {
        const isNewQuestion = question.id.startsWith('q-');

        if (isNewQuestion) {
          // Insert new question
          const { data: newQuestion, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quiz.id,
              question: question.question,
              explanation: question.explanation || null,
              allow_multiple_answers: question.allowMultipleAnswers,
              order_index: question.order
            })
            .select()
            .single();

          if (questionError) {
            throw new Error(`Failed to insert question: ${questionError.message}`);
          }

          // Insert options for new question
          const optionsToInsert = question.options.map((option, index) => ({
            question_id: newQuestion.id,
            text: option.text,
            is_correct: option.isCorrect,
            order_index: index
          }));

          const { error: optionsError } = await supabase
            .from('quiz_options')
            .insert(optionsToInsert);

          if (optionsError) {
            throw new Error(`Failed to insert options: ${optionsError.message}`);
          }
        } else {
          // Update existing question
          const { error: questionError } = await supabase
            .from('quiz_questions')
            .update({
              question: question.question,
              explanation: question.explanation || null,
              allow_multiple_answers: question.allowMultipleAnswers,
              order_index: question.order
            })
            .eq('id', question.id);

          if (questionError) {
            throw new Error(`Failed to update question: ${questionError.message}`);
          }

          // Delete all existing options for this question
          await supabase
            .from('quiz_options')
            .delete()
            .eq('question_id', question.id);

          // Insert new options
          const optionsToInsert = question.options.map((option, index) => ({
            question_id: question.id,
            text: option.text,
            is_correct: option.isCorrect,
            order_index: index
          }));

          const { error: optionsError } = await supabase
            .from('quiz_options')
            .insert(optionsToInsert);

          if (optionsError) {
            throw new Error(`Failed to insert options: ${optionsError.message}`);
          }
        }
      }

      // Clear caches
      this.cache.delete(quiz.id);
      this.listCache = null;

      console.log('[QuizService] Quiz saved successfully');
    } catch (error) {
      console.error('[QuizService] Error saving quiz:', error);
      throw error;
    }
  }

  /**
   * Delete a quiz
   */
  static async deleteQuiz(quizId: string): Promise<void> {
    console.log('[QuizService] Deleting quiz:', quizId);

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) {
      console.error('[QuizService] Error deleting quiz:', error);
      throw new Error(`Failed to delete quiz: ${error.message}`);
    }

    // Clear caches
    this.cache.delete(quizId);
    this.listCache = null;
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.cache.clear();
    this.listCache = null;
  }

  /**
   * Helper to map database row to Quiz type
   */
  private static mapQuizRowToQuiz(row: QuizRow): Quiz {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      status: row.status,
      timeLimit: row.time_limit || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questions: [] // Questions not loaded in list view
    };
  }
}

/**
 * Local storage service for quiz drafts
 */
export class QuizDraftService {
  private static STORAGE_KEY_PREFIX = 'quiz_draft_';
  private static AUTO_SAVE_DEBOUNCE = 2000; // 2 seconds
  private static saveTimeout: NodeJS.Timeout | null = null;

  /**
   * Save quiz draft to local storage (debounced)
   */
  static saveDraft(quizId: string, quiz: Quiz): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const key = `${this.STORAGE_KEY_PREFIX}${quizId}`;
        const data = {
          quiz,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
        console.log('[QuizDraftService] Draft saved to local storage:', quizId);
      } catch (error) {
        console.error('[QuizDraftService] Error saving draft:', error);
      }
    }, this.AUTO_SAVE_DEBOUNCE);
  }

  /**
   * Load quiz draft from local storage
   */
  static loadDraft(quizId: string): { quiz: Quiz; savedAt: string } | null {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${quizId}`;
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      console.log('[QuizDraftService] Draft loaded from local storage:', quizId);
      return parsed;
    } catch (error) {
      console.error('[QuizDraftService] Error loading draft:', error);
      return null;
    }
  }

  /**
   * Delete quiz draft from local storage
   */
  static deleteDraft(quizId: string): void {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${quizId}`;
      localStorage.removeItem(key);
      console.log('[QuizDraftService] Draft deleted from local storage:', quizId);
    } catch (error) {
      console.error('[QuizDraftService] Error deleting draft:', error);
    }
  }

  /**
   * Check if draft exists
   */
  static hasDraft(quizId: string): boolean {
    const key = `${this.STORAGE_KEY_PREFIX}${quizId}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all draft quiz IDs
   */
  static getAllDraftIds(): string[] {
    const draftIds: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
        draftIds.push(key.replace(this.STORAGE_KEY_PREFIX, ''));
      }
    }
    return draftIds;
  }

  /**
   * Clear all drafts
   */
  static clearAllDrafts(): void {
    const draftIds = this.getAllDraftIds();
    draftIds.forEach(id => this.deleteDraft(id));
  }
}
