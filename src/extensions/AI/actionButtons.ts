import { Globe, BrainCog, FolderCode, ImageIcon } from 'lucide-react';

export interface ActionButtonConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const createActionButtons = (
  showSearch: boolean,
  showThink: boolean,
  showCanvas: boolean,
  showImage: boolean,
  onToggleSearch: () => void,
  onToggleThink: () => void,
  onToggleCanvas: () => void,
  onToggleImage: () => void,
  isDisabled: boolean,
): ActionButtonConfig[] => {
  return [
    {
      id: 'search',
      label: 'Search',
      icon: Globe,
      color: '#10B981',
      bgColor: 'bg-[#10B981]/20',
      hoverBgColor: 'hover:bg-[#10B981]/30',
      isActive: showSearch,
      disabled: isDisabled,
      onClick: onToggleSearch,
    },
    {
      id: 'think',
      label: 'Think',
      icon: BrainCog,
      color: '#8B5CF6',
      bgColor: 'bg-[#8B5CF6]/20',
      hoverBgColor: 'hover:bg-[#8B5CF6]/30',
      isActive: showThink,
      disabled: isDisabled,
      onClick: onToggleThink,
    },
    {
      id: 'canvas',
      label: 'Canvas',
      icon: FolderCode,
      color: '#F97316',
      bgColor: 'bg-[#F97316]/20',
      hoverBgColor: 'hover:bg-[#F97316]/30',
      isActive: showCanvas,
      disabled: isDisabled,
      onClick: onToggleCanvas,
    },
    {
      id: 'image',
      label: 'Generate Image',
      icon: ImageIcon,
      color: '#EC4899',
      bgColor: 'bg-[#EC4899]/20',
      hoverBgColor: 'hover:bg-[#EC4899]/30',
      isActive: showImage,
      disabled: isDisabled,
      onClick: onToggleImage,
    },
  ];
};
