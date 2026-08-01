import { faker } from '@faker-js/faker';

/**
 * Quiz Factory for E2E Tests
 *
 * Generates test quiz data with questions and options.
 * Supports draft, published, and archived statuses.
 */

export type QuizStatus = 'draft' | 'published' | 'archived';

export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
};

export type QuizQuestion = {
  id: string;
  quizId: string;
  text: string;
  order: number;
  options: QuizOption[];
  allowMultiple: boolean;
};

export type Quiz = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  status: QuizStatus;
  zoneId: string;
  createdAt: Date;
  updatedAt: Date;
  questions: QuizQuestion[];
};

/**
 * Create a quiz option with optional overrides
 */
export const createQuizOption = (overrides: Partial<QuizOption> = {}): QuizOption => ({
  id: faker.string.uuid(),
  text: faker.lorem.sentence(),
  isCorrect: false,
  order: faker.number.int({ min: 0, max: 3 }),
  ...overrides,
});

/**
 * Create a quiz question with options
 */
export const createQuizQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => {
  const optionCount = faker.number.int({ min: 2, max: 4 });
  const correctOptionIndex = faker.number.int({ min: 0, max: optionCount - 1 });

  const options = Array.from({ length: optionCount }, (_, i) =>
    createQuizOption({
      order: i,
      isCorrect: i === correctOptionIndex,
    })
  );

  return {
    id: faker.string.uuid(),
    quizId: faker.string.uuid(),
    text: faker.lorem.sentence({ min: 5, max: 15 }) + '?',
    order: faker.number.int({ min: 0, max: 10 }),
    options,
    allowMultiple: faker.datatype.boolean(),
    ...overrides,
  };
};

/**
 * Create a quiz with optional overrides.
 *
 * @example
 * const quiz = createQuiz() // Default draft quiz
 * const published = createQuiz({ status: 'published' }) // Published quiz
 * const custom = createQuiz({ zoneId: 'zone-1', questionCount: 5 })
 */
export const createQuiz = (overrides: Partial<Quiz> & { questionCount?: number } = {}): Quiz => {
  const { questionCount = faker.number.int({ min: 3, max: 10 }), ...restOverrides } = overrides;

  const zoneId = restOverrides.zoneId || faker.helpers.arrayElement([
    'north-east',
    'red-river-delta',
    'north-central',
    'south-central',
    'central-highlands',
    'southern',
  ]);

  const questions = Array.from({ length: questionCount }, () =>
    createQuizQuestion({ quizId: faker.string.uuid() })
  );

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    titleEn: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    descriptionEn: faker.lorem.paragraph(),
    status: 'draft',
    zoneId,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions,
    ...restOverrides,
  };
};

/**
 * Create a published quiz (convenience factory)
 */
export const createPublishedQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  createQuiz({ status: 'published', ...overrides });

/**
 * Create an archived quiz (convenience factory)
 */
export const createArchivedQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  createQuiz({ status: 'archived', ...overrides });
