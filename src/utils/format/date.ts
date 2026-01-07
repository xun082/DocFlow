/**
 * Date and time formatting utilities
 */

export interface FormatDateTimeOptions {
  showSeconds?: boolean;
}

/**
 * Format ISO date string to localized date-time string
 * @param dateStr - ISO date string
 * @param options - Formatting options
 * @returns Formatted date-time string (YYYY/MM/DD HH:mm:ss or YYYY/MM/DD HH:mm)
 */
export function formatDateTime(dateStr: string, options: FormatDateTimeOptions = {}): string {
  if (!dateStr) return '';

  const { showSeconds = true } = options;

  try {
    const date = new Date(dateStr);

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
    });
  } catch {
    return dateStr;
  }
}
