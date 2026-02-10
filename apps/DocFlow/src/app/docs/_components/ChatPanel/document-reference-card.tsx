'use client';

import { X, FileText } from 'lucide-react';

import type { DocumentReference } from '@/stores/chatStore';
import { cn } from '@/utils';

interface DocumentReferenceCardProps {
  reference: DocumentReference;
  onRemove: () => void;
  className?: string;
}

export function DocumentReferenceCard({
  reference,
  onRemove,
  className,
}: DocumentReferenceCardProps) {
  return (
    <div className={cn('mb-3 animate-in slide-in-from-bottom-2 duration-200', className)}>
      <div className="relative flex items-start gap-2.5 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500 text-white shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-emerald-700">文档引用</span>
            <span className="text-xs text-emerald-600/70">已选中 {reference.charCount} 字符</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate font-medium">{reference.fileName}</span>
            <span className="text-emerald-500/70">
              (行 {reference.startLine}-{reference.endLine})
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-emerald-200/50 text-emerald-600 transition-colors shrink-0"
          title="移除引用"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
