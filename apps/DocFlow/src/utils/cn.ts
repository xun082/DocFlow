/**
 * Tailwind CSS class utility
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind class merging
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string with proper Tailwind precedence
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', isActive && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
