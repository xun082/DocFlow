'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import React, { JSX } from 'react';

import { TooltipProps } from './types';

const isMac =
  typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

const ShortcutKey = ({ children }: { children: string }): JSX.Element => {
  const className =
    'inline-flex items-center justify-center w-5 h-5 p-1 text-[0.625rem] rounded font-semibold leading-none border border-neutral-200 text-neutral-500 border-b-2';

  if (children === 'Mod') {
    return <kbd className={className}>{isMac ? '⌘' : 'Ctrl'}</kbd>; // ⌃
  }

  if (children === 'Shift') {
    return <kbd className={className}>⇧</kbd>;
  }

  if (children === 'Alt') {
    return <kbd className={className}>{isMac ? '⌥' : 'Alt'}</kbd>;
  }

  return <kbd className={className}>{children}</kbd>;
};

export const Tooltip = ({
  children,
  enabled = true,
  title,
  shortcut,
}: TooltipProps): JSX.Element => {
  if (!enabled || (!title && !shortcut)) {
    return <>{children}</>;
  }

  return (
    <RadixTooltip.Provider delayDuration={500}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {typeof children === 'string' ? <span>{children}</span> : children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="flex items-center gap-2 px-2.5 py-1 bg-white border border-neutral-100 rounded-lg shadow-sm z-[999]"
            sideOffset={8}
          >
            {title && <span className="text-xs font-medium text-neutral-500">{title}</span>}
            {shortcut && (
              <span className="flex items-center gap-0.5">
                {shortcut.map((shortcutKey) => (
                  <ShortcutKey key={shortcutKey}>{shortcutKey}</ShortcutKey>
                ))}
              </span>
            )}
            <RadixTooltip.Arrow className="fill-white" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
