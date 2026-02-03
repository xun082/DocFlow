import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useCallback } from 'react';

import { DropdownButton } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { Surface } from '@/components/ui/Surface';
import { Toolbar } from '@/components/ui/Toolbar';

const FONT_SIZES = [
  { label: 'Smaller', value: '12px' },
  { label: 'Small', value: '14px' },
  { label: 'Medium', value: '' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '24px' },
];

export type FontSizePickerProps = {
  onChange: (value: string) => void;
  value: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const FontSizePicker = ({ onChange, value, open, onOpenChange }: FontSizePickerProps) => {
  const currentValue = FONT_SIZES.find((size) => size.value === value);
  const currentSizeLabel = currentValue?.label.split(' ')[0] || 'Medium';

  const selectSize = useCallback((size: string) => () => onChange(size), [onChange]);

  return (
    <Dropdown.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dropdown.Trigger asChild>
        <Toolbar.Button active={!!currentValue?.value}>
          {currentSizeLabel}
          <Icon name="ChevronDown" className="w-2 h-2" />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content asChild onCloseAutoFocus={(event) => event.preventDefault()}>
        <Surface className="flex flex-col gap-1 px-2 py-4">
          {FONT_SIZES.map((size) => (
            <DropdownButton
              isActive={value === size.value}
              onClick={selectSize(size.value)}
              key={`${size.label}_${size.value}`}
            >
              <span style={{ fontSize: size.value }}>{size.label}</span>
            </DropdownButton>
          ))}
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
