import React, { useState, useRef, useEffect } from 'react';
import { Hash } from 'lucide-react';

interface ConcurrencySelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const ConcurrencySelector: React.FC<ConcurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const concurrencyOptions = [
    { value: 1, label: '1 个方案' },
    { value: 2, label: '2 个方案' },
    { value: 3, label: '3 个方案' },
    { value: 4, label: '4 个方案' },
    { value: 5, label: '5 个方案' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newValue: number) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const selectedOption = concurrencyOptions.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
          rounded-md transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          bg-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/30
        `}
      >
        <Hash className="w-3.5 h-3.5" />
        <span>{selectedOption?.label || '1 个方案'}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {concurrencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-3 py-2 text-xs transition-colors
                  ${
                    option.value === value
                      ? 'bg-[#7C3AED]/10 text-[#7C3AED] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcurrencySelector;
