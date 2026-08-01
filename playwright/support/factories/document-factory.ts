import { faker } from '@faker-js/faker';

/**
 * Document Factory for E2E Tests
 *
 * Generates test document metadata for file upload and storage tests.
 */

export type Document = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  zoneId: string;
  createdAt: Date;
  updatedAt: Date;
  storagePath: string;
  downloadCount: number;
};

const VALID_FILE_TYPES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'] as const;
const DOCUMENT_CATEGORIES = ['policy', 'regulation', 'guide', 'report', 'statistics', 'other'] as const;
const ZONE_IDS = ['north-east', 'red-river-delta', 'north-central', 'south-central', 'central-highlands', 'southern'] as const;

/**
 * Create a test document with optional overrides.
 *
 * @example
 * const doc = createDocument() // Default document
 * const pdf = createDocument({ fileType: 'pdf', category: 'policy' })
 * const large = createDocument({ fileSize: 5242880 }) // 5MB file
 */
export const createDocument = (overrides: Partial<Document> = {}): Document => {
  const fileType = faker.helpers.arrayElement(VALID_FILE_TYPES);
  const category = faker.helpers.arrayElement(DOCUMENT_CATEGORIES);
  const zoneId = faker.helpers.arrayElement(ZONE_IDS);

  // Generate realistic file sizes (100KB to 5MB)
  const fileSize = faker.number.int({ min: 102400, max: 5242880 });

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    titleEn: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    descriptionEn: faker.lorem.paragraph(),
    fileName: `${faker.string.alphanumeric({ length: 8 })}.${fileType}`,
    fileSize,
    fileType,
    category,
    zoneId,
    createdAt: new Date(),
    updatedAt: new Date(),
    storagePath: `documents/${zoneId}/${faker.string.uuid()}.${fileType}`,
    downloadCount: faker.number.int({ min: 0, max: 1000 }),
    ...overrides,
  };
};

/**
 * Create a PDF document (convenience factory)
 */
export const createPDFDocument = (overrides: Partial<Document> = {}): Document =>
  createDocument({ fileType: 'pdf', ...overrides });

/**
 * Create a large document for upload limit tests
 */
export const createLargeDocument = (size: number = 52428800, overrides: Partial<Document> = {}): Document =>
  createDocument({ fileSize: size, ...overrides });

/**
 * Create a document for a specific zone
 */
export const createZoneDocument = (zoneId: string, overrides: Partial<Document> = {}): Document =>
  createDocument({ zoneId, ...overrides });
