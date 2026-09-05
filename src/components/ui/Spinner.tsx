import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type SpinnerProps = HTMLAttributes<HTMLDivElement>;

/**
 * Spinner — the single loading indicator. See DESIGN.md → Components.
 * Override size via className (e.g. "h-12 w-12"); defaults to h-8 w-8.
 */
export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-muted border-t-brand',
        'h-8 w-8',
        className,
      )}
      {...props}
    />
  );
}
