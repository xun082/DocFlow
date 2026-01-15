'use client';

import React, { useState } from 'react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { ChevronsUpDown, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils';

interface CodeBlockThemeProps extends Omit<ReactNodeViewProps, 'getPos'> {
  editor: any;
  getPos: () => number | undefined;
}

function CodeBlockTheme(props: CodeBlockThemeProps) {
  const { node, updateAttributes, extension } = props;
  const defaultTheme = node.attrs.theme || 'null';

  const { onThemeChange } = extension.options;

  const [themeOpen, setThemeOpen] = useState(false);

  // 获取所有可用语言，合并自定义语言
  const themes = [
    { value: 'default' },
    { value: 'dark' },
    { value: '1c-light' },
    { value: 'a11y-dark' },
    { value: 'a11y-light' },
    { value: 'agate' },
    { value: 'an-old-hope' },
    { value: 'androidstudio' },
    { value: 'arduino-light' },
    { value: 'arta' },
    { value: 'ascetic' },
    { value: 'atom-one-dark-reasonable' },
    { value: 'atom-one-dark' },
    { value: 'atom-one-light' },
    { value: 'base16' },
    { value: 'brown-paper' },
    { value: 'codepen-embed' },
    { value: 'color-brewer' },
    { value: 'cybertopia-cherry' },
    { value: 'cybertopia-dimmer' },
    { value: 'cybertopia-icecap' },
    { value: 'cybertopia-saturated' },
    { value: 'devibeans' },
    { value: 'docco' },
    { value: 'far' },
    { value: 'felipec' },
    { value: 'foundation' },
    { value: 'github-dark-dimmed' },
    { value: 'github-dark' },
    { value: 'github' },
    { value: 'gml' },
    { value: 'googlecode' },
    { value: 'gradient-dark' },
    { value: 'gradient-light' },
    { value: 'grayscale' },
    { value: 'hybrid' },
    { value: 'idea' },
    { value: 'intellij-light' },
    { value: 'ir-black' },
    { value: 'isbl-editor-dark' },
    { value: 'isbl-editor-light' },
    { value: 'kimbie-dark' },
    { value: 'kimbie-light' },
    { value: 'lightfair' },
    { value: 'lioshi' },
    { value: 'magula' },
    { value: 'mono-blue' },
    { value: 'monokai-sublime' },
    { value: 'monokai' },
    { value: 'night-owl' },
    { value: 'nnfx-dark' },
    { value: 'nnfx-light' },
    { value: 'nord' },
    { value: 'obsidian' },
    { value: 'panda-syntax-dark' },
    { value: 'panda-syntax-light' },
    { value: 'paraiso-dark' },
    { value: 'paraiso-light' },
    { value: 'pojoaque' },
    { value: 'purebasic' },
    { value: 'qtcreator-dark' },
    { value: 'qtcreator-light' },
    { value: 'rainbow' },
    { value: 'rose-pine-dawn' },
    { value: 'rose-pine-moon' },
    { value: 'rose-pine' },
    { value: 'routeros' },
    { value: 'school-book' },
    { value: 'shades-of-purple' },
    { value: 'srcery' },
    { value: 'stackoverflow-dark' },
    { value: 'stackoverflow-light' },
    { value: 'sunburst' },
    { value: 'tokyo-night-dark' },
    { value: 'tokyo-night-light' },
    { value: 'tomorrow-night-blue' },
    { value: 'tomorrow-night-bright' },
    { value: 'vs' },
    { value: 'vs2015' },
    { value: 'xcode' },
    { value: 'xt256' },
  ];

  const selectedTheme = themes.find((theme) => theme.value === defaultTheme);

  const handleThemeChange = (theme: string) => {
    // 使用 setTimeout 延迟更新，避免在渲染期间更新
    setTimeout(() => {
      updateAttributes({ theme });
      onThemeChange?.(theme);
    }, 0);
  };

  return (
    <div className="theme-selector">
      <Popover open={themeOpen} onOpenChange={setThemeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={themeOpen}
            className="w-[160px] justify-between h-8 text-xs"
          >
            {selectedTheme?.value || '代码高亮样式'}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="搜索样式..." className="h-8" />
              <CommandSeparator />
              <CommandEmpty>未找到样式</CommandEmpty>
              <CommandGroup>
                {themes.map((theme) => (
                  <CommandItem
                    key={theme.value}
                    value={theme.value}
                    onSelect={(currentValue) => {
                      handleThemeChange(currentValue);
                      setThemeOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3 w-3',
                        defaultTheme === theme.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {theme.value}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CodeBlockTheme;
