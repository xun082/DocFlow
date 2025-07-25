import { cn } from '@/utils/utils';

export type ColorButtonProps = {
  color?: string;
  active?: boolean;
  onColorChange?: (color: string) => void;
};

export function ColorButton({ color, active, onColorChange }: ColorButtonProps) {
  const wrapperClassName = cn(
    'flex items-center justify-center px-1.5 py-1.5 rounded group',
    !active && 'hover:bg-neutral-100',
    active && 'bg-neutral-100',
  );
  const bubbleClassName = cn(
    'w-4 h-4 rounded bg-slate-100 shadow-sm ring-offset-2 ring-current',
    !active && `hover:ring-1`,
    active && `ring-1`,
  );

  const handleClick = () => {
    if (onColorChange) {
      onColorChange(color || '');
    }
  };

  return (
    <button onClick={handleClick} className={wrapperClassName}>
      <div style={{ backgroundColor: color, color: color }} className={bubbleClassName}></div>
    </button>
  );
}
