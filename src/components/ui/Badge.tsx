import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
  info: 'bg-info-soft text-info-strong',
  neutral: 'bg-muted text-muted-foreground',
};

/**
 * Badge — status / category pill. See DESIGN.md → Components.
 * Tone carries meaning only (success / warning / danger / info / neutral) —
 * never use a tone as decoration.
 */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
