// Shared UI primitives. Single source of truth for look-and-feel: DESIGN.md (repo root).
// Tokens resolve via tailwind.config.js theme.extend.

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Input, Textarea, Select } from './Input';

export { Badge } from './Badge';
export type { BadgeProps, BadgeTone } from './Badge';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';
