import React from 'react';
import { Square } from 'lucide-react';

import Button from './Button';

interface AILoadingStatusProps {
  onCancel: () => void;
}

const AILoadingStatus: React.FC<AILoadingStatusProps> = ({ onCancel }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="rounded-3xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm font-medium">AI is writing</span>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: '200ms' }}
              />
              <div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: '400ms' }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-[#6B7280] hover:text-[#374151] hover:bg-gray-200/50"
            onClick={onCancel}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AILoadingStatus;
