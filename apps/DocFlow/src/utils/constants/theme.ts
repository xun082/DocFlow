/**
 * Theme-related constants
 */

/**
 * Default theme colors used across the application
 */
export const themeColors = [
  '#fb7185',
  '#fdba74',
  '#d9f99d',
  '#a7f3d0',
  '#a5f3fc',
  '#a5b4fc',
] as const;

/**
 * Cursor colors for collaborative editing
 */
export const cursorColors = [
  '#5D8AA8', // Steel Blue
  '#E32636', // Alizarin Crimson
  '#FF8C00', // Dark Orange
  '#9932CC', // Dark Orchid
  '#00FF7F', // Spring Green
  '#FF1493', // Deep Pink
  '#7B68EE', // Medium Slate Blue
  '#FFD700', // Gold
  '#008080', // Teal
  '#FF4500', // Orange Red
  '#4682B4', // Steel Blue
  '#6A5ACD', // Slate Blue
  '#32CD32', // Lime Green
  '#FF69B4', // Hot Pink
  '#CD5C5C', // Indian Red
  '#4169E1', // Royal Blue
  '#8A2BE2', // Blue Violet
  '#3CB371', // Medium Sea Green
  '#7CFC00', // Lawn Green
  '#BA55D3', // Medium Orchid
  '#E6E6FA', // Lavender
  '#800000', // Maroon
  '#9370DB', // Medium Purple
  '#ADFF2F', // Green Yellow
] as const;

/**
 * Get a random cursor color for collaborative editing
 * @returns Random cursor color hex string
 */
export function getRandomCursorColor(): string {
  return cursorColors[Math.floor(Math.random() * cursorColors.length)];
}

/**
 * Get deterministic cursor color based on user ID
 * Same user ID always returns the same color
 * @param userId - User identifier
 * @returns Cursor color hex string
 */
export function getCursorColorByUserId(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % cursorColors.length;

  return cursorColors[colorIndex];
}

/**
 * Get all available cursor colors
 * @returns Array of all cursor color hex strings
 */
export function getAllCursorColors(): readonly string[] {
  return cursorColors;
}
