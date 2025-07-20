import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { Surface } from '@/components/ui/Surface';
import { Toggle } from '@/components/ui/Toggle';

export type LinkEditorPanelProps = {
  initialUrl?: string;
  initialOpenInNewTab?: boolean;
  onSetLink: (url: string, openInNewTab?: boolean) => void;
};

function useLinkEditorState({ initialUrl, initialOpenInNewTab, onSetLink }: LinkEditorPanelProps) {
  const [url, setUrl] = useState(initialUrl || '');
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab || false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const isValidUrl = /^(\S+):(\/\/)?\S+$/.test(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isValidUrl) {
      onSetLink(url, openInNewTab);
    }
  };

  return {
    url,
    setUrl,
    openInNewTab,
    setOpenInNewTab,
    onChange,
    handleSubmit,
    isValidUrl,
  };
}

export function LinkEditorPanel({
  onSetLink,
  initialOpenInNewTab,
  initialUrl,
}: LinkEditorPanelProps) {
  const state = useLinkEditorState({ onSetLink, initialOpenInNewTab, initialUrl });

  return (
    <Surface className="p-2">
      <form onSubmit={state.handleSubmit} className="flex items-center gap-2">
        <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 cursor-text">
          <Icon name="Link" className="flex-none text-black dark:text-white" />
          <input
            type="url"
            className="flex-1 bg-transparent outline-none min-w-[12rem] text-black text-sm dark:text-white"
            placeholder="Enter URL"
            value={state.url}
            onChange={state.onChange}
          />
        </label>
        <Button variant="default" size="sm" type="submit" disabled={!state.isValidUrl}>
          Set Link
        </Button>
      </form>
      <div className="mt-3">
        <label className="flex items-center justify-start gap-2 text-sm font-semibold cursor-pointer select-none text-neutral-500 dark:text-neutral-400">
          Open in new tab
          <Toggle active={state.openInNewTab} onChange={state.setOpenInNewTab} />
        </label>
      </div>
    </Surface>
  );
}
