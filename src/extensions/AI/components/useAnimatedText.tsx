import { useEffect, useState } from 'react';
import TypeIt from 'typeit-react';
import { ReactElement } from 'react';

type SetTextFunction = (text: string) => void;

export function useAnimatedText(): [ReactElement, SetTextFunction] {
  const [instance, setInstance] = useState<any>(null);
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (!instance) return;
    console.log('text', text);

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
      element="p"
      options={{ cursor: false, breakLines: true }}
      getAfterInit={(i: any) => {
        setInstance(i);

        return i;
      }}
    ></TypeIt>
  );

  return [el, setText];
}
