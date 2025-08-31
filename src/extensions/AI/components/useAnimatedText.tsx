import { useEffect, useState } from 'react';
import TypeIt from 'typeit-react';
import { ReactElement } from 'react';
import { Editor } from '@tiptap/core';

type SetTextFunction = (text: string) => void;

export function useAnimatedText(editor: Editor): [ReactElement, SetTextFunction] {
  const [instance, setInstance] = useState<any>(null);
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (!instance) return;

    if (text !== '') {
      // 使用正确的 flush 方法调用，提供回调函数避免 flushCallback 错误
      instance.type(text, { instant: true }).flush(() => {
        // 打字机效果完成后的回调
        console.log('TypeIt animation completed');
      });
    }
  }, [text, instance]);

  const el = (
    <TypeIt
      options={{
        cursor: false,
        breakLines: true,
        html: true,
        beforeString: (text: string) => {
          console.log('匹配文本:', text);
          console.log('正则匹配结果:', /`{3}/g.test(text));

          if (/`{3}/g.test(text)) {
            // const lang = (text.match(/```(\w+)/) || [, ''])[1];
            editor.chain().focus().toggleCodeBlock().run();
            // editor.commands.setCodeBlock({ language: lang });
          }
        },
      }}
      getAfterInit={(i: any) => {
        setInstance(i);

        return i;
      }}
    ></TypeIt>
  );

  return [el, setText];
}
