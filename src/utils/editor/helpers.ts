/**
 * General editor helper utilities
 */

// Re-export cn function for backward compatibility
export { cn } from '../cn';

/**
 * Get random element from array
 * @param array - Source array
 * @returns Random element
 */
export function randomElement<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}
