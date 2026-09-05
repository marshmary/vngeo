import { type ReactNode } from 'react';
import clsx from 'clsx';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Accessible label for the Previous button — pass the existing i18n string. */
  previousPageLabel: string;
  /** Accessible label for the Next button — pass the existing i18n string. */
  nextPageLabel: string;
  className?: string;
}

const navButton =
  'px-4 py-2 bg-card border border-border rounded-button text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

/**
 * Pagination — shared page control. See DESIGN.md → Components.
 *
 * e2e contract preserved verbatim:
 *  - renders real <button disabled> for prev/next with the caller's aria-labels
 *    (documents.spec.ts selects `button[aria-label="Previous page"]` / `Next page`);
 *  - the ACTIVE page button keeps the raw `bg-indigo-600` class — that class
 *    string is asserted by documents.spec.ts and read by document-helpers
 *    getCurrentPage(). bg-indigo-600 is the brand color (#4f46e5 == bg-brand);
 *    see MIGRATION-CONTRACT.md holdout #1.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  previousPageLabel,
  nextPageLabel,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: ReactNode[] = [];
  for (let page = 1; page <= totalPages; page++) {
    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
    const showEllipsis =
      (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

    if (showEllipsis) {
      pages.push(
        <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
          ...
        </span>,
      );
      continue;
    }
    if (!showPage) continue;

    pages.push(
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={clsx(
          'px-4 py-2 rounded-button text-sm font-medium transition-colors',
          currentPage === page
            ? 'bg-indigo-600 text-white'
            : 'bg-card border border-border text-foreground hover:bg-muted',
        )}
      >
        {page}
      </button>,
    );
  }

  return (
    <div className={clsx('mt-8 flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={navButton}
        aria-label={previousPageLabel}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-2">{pages}</div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={navButton}
        aria-label={nextPageLabel}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
