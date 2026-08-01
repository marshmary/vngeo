/**
 * Document Helpers for E2E Tests
 *
 * Utilities for document-related test operations including
 * filtering, pagination, and download verification.
 */

import type { Page } from '@playwright/test';
import type { Document } from '../factories/document-factory';

/**
 * Navigate to documents page and wait for load.
 */
export async function goToDocuments(page: Page): Promise<void> {
  await page.goto('/documents');
  await page.waitForLoadState('networkidle');
}

/**
 * Filter documents by folder/category.
 */
export async function filterByFolder(page: Page, folderName: string): Promise<void> {
  const filterButton = page.locator('button').filter({ hasText: new RegExp(folderName, 'i') });
  await filterButton.click();
  await page.waitForTimeout(500); // Wait for filter to apply
}

/**
 * Reset to "All" filter.
 */
export async function resetFilter(page: Page): Promise<void> {
  const allButton = page.locator('button').filter({ hasText: /All|Tất cả/i });
  await allButton.click();
  await page.waitForTimeout(500);
}

/**
 * Go to next page of documents.
 */
export async function goToNextPage(page: Page): Promise<void> {
  const nextButton = page.locator('button[aria-label="Next page"]');
  const isDisabled = await nextButton.isDisabled();

  if (!isDisabled) {
    await nextButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Go to previous page of documents.
 */
export async function goToPreviousPage(page: Page): Promise<void> {
  const prevButton = page.locator('button[aria-label="Previous page"]');
  const isDisabled = await prevButton.isDisabled();

  if (!isDisabled) {
    await prevButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Get current page number.
 */
export async function getCurrentPage(page: Page): Promise<number> {
  const activePageButton = page.locator('button').filter({ hasClass: /bg-indigo-600/ });
  const text = await activePageButton.first().textContent();
  return text ? parseInt(text.trim()) : 1;
}

/**
 * Refresh documents list.
 */
export async function refreshDocuments(page: Page): Promise<void> {
  const refreshButton = page.locator('button').filter({ hasText: /Refresh|Làm mới/i });
  await refreshButton.click();

  // Wait for loading state to complete
  const loadingSpinner = page.locator('.animate-spin');
  if (await loadingSpinner.count() > 0) {
    await loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 });
  }
}

/**
 * Click download button on first document card.
 */
export async function downloadFirstDocument(page: Page): Promise<void> {
  const downloadButton = page.locator('a').filter({ hasText: /Download|Tải về/i }).first();

  if (await downloadButton.count() > 0) {
    // Setup download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await downloadButton.click();
    await downloadPromise;
  }
}

/**
 * Count visible document cards.
 */
export async function countDocumentCards(page: Page): Promise<number> {
  const cards = page.locator('.bg-white.rounded-xl.shadow-md');
  return await cards.count();
}

/**
 * Get document card data by index.
 */
export async function getDocumentCardData(page: Page, index: number): Promise<{
  name: string;
  folder: string;
  fileExtension: string;
  fileSize: string;
} | null> {
  const cards = page.locator('.bg-white.rounded-xl.shadow-md');

  if (await cards.count() <= index) {
    return null;
  }

  const card = cards.nth(index);

  const name = await card.locator('h3').textContent() || '';
  const folder = await card.locator('.text-indigo-600.bg-indigo-50').textContent() || '';
  const fileExtension = await card.locator('span.text-gray-500').textContent() || '';
  const fileSize = await card.locator('span.text-xs.text-gray-500').first().textContent() || '';

  return { name: name.trim(), folder: folder.trim(), fileExtension: fileExtension.trim(), fileSize: fileSize.trim() };
}

/**
 * Verify document metadata is displayed correctly.
 */
export async function verifyDocumentMetadata(page: Page, expected: Partial<Document>): Promise<boolean> {
  const cards = page.locator('.bg-white.rounded-xl.shadow-md');

  for (let i = 0; i < await cards.count(); i++) {
    const cardData = await getDocumentCardData(page, i);

    if (cardData && expected.fileName && cardData.name.includes(expected.fileName)) {
      return true;
    }
  }

  return false;
}
