import type { NodeViewProps } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, FileText, Lightbulb } from 'lucide-react';
import React from 'react';

import type { AlertType } from './Alert';

const alertConfig: Record<
  AlertType,
  {
    Icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  info: {
    Icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-l-blue-500',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    Icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-l-yellow-500',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    Icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-l-red-500',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  success: {
    Icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-l-green-500',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  note: {
    Icon: FileText,
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-l-purple-500',
    textColor: 'text-purple-900 dark:text-purple-100',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  tip: {
    Icon: Lightbulb,
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-l-cyan-500',
    textColor: 'text-cyan-900 dark:text-cyan-100',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
};

export const AlertComponent: React.FC<NodeViewProps> = ({ node }) => {
  const alertType = (node.attrs.type as AlertType) || 'info';
  const config = alertConfig[alertType] || alertConfig.info;
  const { Icon } = config;

  return (
    <NodeViewWrapper
      className={`my-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} ${config.textColor}`}
      data-alert-type={alertType}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex-shrink-0" contentEditable={false} draggable={false}>
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <NodeViewContent className="prose prose-sm max-w-none dark:prose-invert [&>*]:my-0.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default AlertComponent;
