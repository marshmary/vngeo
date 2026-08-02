/**
 * Mobile Sidebar Helpers for E2E Tests
 *
 * Below the lg breakpoint (<1024px) the app sidebar (`data-testid="navbar"`) is
 * off-canvas (`-translate-x-full`) until the hamburger button opens it. Controls
 * that live inside the sidebar (`language-selector`, `user-menu-button`, nav
 * links) are unreachable in that state — Playwright clicks time out with
 * "element is outside of the viewport". These helpers open/close the sidebar
 * conditionally so the same specs run unchanged on desktop and mobile projects.
 */

import { expect, type Page } from '@playwright/test';

const MOBILE_MENU_BUTTON = 'mobile-menu-button';
const SIDEBAR = 'navbar';

/** True when the hamburger button is visible (mobile viewport; lg:hidden on desktop). */
async function isMobileLayout(page: Page): Promise<boolean> {
  return page
    .getByTestId(MOBILE_MENU_BUTTON)
    .isVisible()
    .catch(() => false);
}

/** True when the sidebar is currently within the viewport. */
async function isSidebarOnScreen(page: Page): Promise<boolean> {
  const box = await page.getByTestId(SIDEBAR).boundingBox();
  return box !== null && box.x >= 0;
}

/**
 * Slide the sidebar in if this is a mobile viewport and it is off-canvas.
 * No-op on desktop (hamburger hidden) or when the sidebar is already open.
 */
export async function openMobileSidebarIfNeeded(page: Page): Promise<void> {
  if (!(await isMobileLayout(page))) return;
  if (await isSidebarOnScreen(page)) return;

  await page.getByTestId(MOBILE_MENU_BUTTON).click();

  // Wait for the slide-in transition (300ms) to settle so subsequent clicks
  // are deterministic rather than relying on click-actionability retries.
  await expect.poll(() => isSidebarOnScreen(page), { timeout: 5000 }).toBe(true);
}

/**
 * Slide the sidebar back out if this is a mobile viewport and it is open.
 * Use after interacting with sidebar controls so the open sidebar and its
 * overlay cannot intercept later page interactions or assertions.
 */
export async function closeMobileSidebarIfOpen(page: Page): Promise<void> {
  if (!(await isMobileLayout(page))) return;
  if (!(await isSidebarOnScreen(page))) return;

  await page.getByTestId(MOBILE_MENU_BUTTON).click();

  await expect.poll(async () => !(await isSidebarOnScreen(page)), { timeout: 5000 }).toBe(true);
}
