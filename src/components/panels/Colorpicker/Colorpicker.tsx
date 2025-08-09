import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

import { ColorButton } from './ColorButton';
import { Toolbar } from '../../ui/Toolbar';
import { Icon } from '../../ui/Icon';

import { themeColors } from '@/utils/constants';

export type ColorPickerProps = {
  color?: string;
  onChange?: (color: string) => void;
  onClear?: () => void;
};

export function ColorPicker({ color, onChange, onClear }: ColorPickerProps) {
  const [colorInputValue, setColorInputValue] = useState(color || '');

  const handleColorUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorInputValue(event.target.value);
  };

  const handleColorChange = () => {
    const isCorrectColor = /^#([0-9A-F]{3}){1,2}$/i.test(colorInputValue);

    if (!isCorrectColor) {
      if (onChange) {
        onChange('');
      }

      return;
    }

    if (onChange) {
      onChange(colorInputValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <HexColorPicker className="w-full" color={color || ''} onChange={onChange} />
      <input
        type="text"
        className="w-full rounded border border-neutral-200 bg-white p-2 text-black focus:ring-0 focus:outline-1 focus:outline-neutral-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:outline-neutral-700"
        placeholder="#000000"
        value={colorInputValue}
        onChange={handleColorUpdate}
        onBlur={handleColorChange}
      />
      <div className="flex max-w-[15rem] flex-wrap items-center gap-1">
        {themeColors.map((currentColor) => (
          <ColorButton
            active={currentColor === color}
            color={currentColor}
            key={currentColor}
            onColorChange={onChange}
          />
        ))}
        <Toolbar.Button tooltip="Reset color to default" onClick={onClear}>
          <Icon name="Undo" />
        </Toolbar.Button>
      </div>
    </div>
  );
}
