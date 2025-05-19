import React from 'react';

export interface TooltipProps {
  children?: string | React.ReactNode;
  enabled?: boolean;
  title?: string;
  shortcut?: string[];
  tippyOptions?: Record<string, unknown>; // Kept for backward compatibility
  content?: React.ReactNode;
}
