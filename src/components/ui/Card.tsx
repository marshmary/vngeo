import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Card — the single surface container. See DESIGN.md → Components.
 * Compose content freely inside; padding is the caller's choice (use the
 * spacing tokens from DESIGN.md, e.g. p-6 for `{spacing.card-padding}`).
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx('bg-card border border-border rounded-card shadow-card', className)}
      {...props}
    />
  );
}
