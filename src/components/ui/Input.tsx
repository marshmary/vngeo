import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';
import clsx from 'clsx';

// Shared field treatment — see DESIGN.md → Components → input.
const fieldBase = clsx(
  'w-full bg-card border border-border text-foreground rounded-input',
  'placeholder:text-faint-foreground',
  'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
  'disabled:opacity-50 disabled:bg-muted transition-colors',
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={clsx('px-3 py-2', fieldBase, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={clsx('px-3 py-2', fieldBase, className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={clsx('px-3 py-2', fieldBase, className)} {...props} />
  ),
);
Select.displayName = 'Select';
