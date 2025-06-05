import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { toast } from 'sonner';

import { Surface } from '@/components/ui/Surface';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { AiApi } from '@/services/ai';

export interface SpellCheckError {
  id: string;
  word: string;
  position: { from: number; to: number };
  suggestions: string[];
  context: string;
}

interface SpellCheckPanelProps {
  editor: Editor;
  onClose: () => void;
}

export const SpellCheckPanel: React.FC<SpellCheckPanelProps> = ({ editor, onClose }) => {
  const [errors, setErrors] = useState<SpellCheckError[]>([]);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkScopeInfo, setCheckScopeInfo] = useState<string>('');
  const [allErrorsProcessed, setAllErrorsProcessed] = useState(false);

  const currentError = errors[currentErrorIndex];

  // 获取当前检查范围信息
  const getCheckScopeInfo = useCallback(() => {
    const selection = editor.state.selection;

    if (!selection.empty) {
      const selectedText = editor.state.doc.textBetween(selection.from, selection.to);

      return `选中文本 (${selectedText.length} 字符)`;
    } else {
      const $pos = selection.$head;
      const paragraph = $pos.node($pos.depth);

      if (paragraph && paragraph.type.name === 'paragraph') {
        return `当前段落 (${paragraph.textContent.length} 字符)`;
      } else {
        const docSize = editor.state.doc.content.size;

        return `整个文档 (${docSize} 字符)`;
      }
    }
  }, [editor]);

  // 使用AI API检测拼写错误 - 直接使用封装好的错误处理
  const detectSpellErrors = useCallback(async () => {
    // 更新检查范围信息
    const scopeInfo = getCheckScopeInfo();
    setCheckScopeInfo(scopeInfo);

    const doc = editor.state.doc;
    const selection = editor.state.selection;

    // 构建文档文本和位置映射表 - 改进的映射逻辑
    const textParts: { text: string; start: number; end: number }[] = [];
    let fullText = '';
    let checkRange: { from: number; to: number } | null = null;

    // 确定检查范围：选中文本 > 当前段落 > 整个文档
    if (!selection.empty) {
      // 如果有选中文本，只检查选中的部分
      checkRange = { from: selection.from, to: selection.to };
      console.log('检查选中文本:', checkRange);
    } else {
      // 如果没有选中，检查当前光标所在的段落
      const $pos = selection.$head;
      const paragraph = $pos.node($pos.depth);

      if (paragraph && paragraph.type.name === 'paragraph') {
        // 计算段落在文档中的位置
        const paragraphStart = $pos.start($pos.depth);
        const paragraphEnd = paragraphStart + paragraph.content.size;
        checkRange = { from: paragraphStart, to: paragraphEnd };
        console.log('检查当前段落:', checkRange, '段落内容:', paragraph.textContent);
      } else {
        // 最后选择：检查整个文档
        checkRange = { from: 0, to: doc.content.size };
        console.log('检查整个文档:', checkRange);
      }
    }

    // 只遍历指定范围内的文档节点
    if (checkRange) {
      doc.nodesBetween(checkRange.from, checkRange.to, (node, pos) => {
        if (node.isText && node.text) {
          // 计算在检查范围内的实际位置
          const nodeStart = Math.max(pos, checkRange.from);
          const nodeEnd = Math.min(pos + node.textContent.length, checkRange.to);

          if (nodeStart < nodeEnd) {
            // 获取在范围内的文本部分
            const textStart = nodeStart - pos;
            const textEnd = nodeEnd - pos;
            const textInRange = node.text.slice(textStart, textEnd);

            if (textInRange.trim()) {
              textParts.push({
                text: textInRange,
                start: nodeStart,
                end: nodeEnd,
              });
              fullText += textInRange;
            }
          }
        } else if (node.type.name === 'paragraph' || node.type.name === 'heading') {
          // 段落和标题后添加换行符，但不影响位置计算
          if (fullText.length > 0 && !fullText.endsWith('\n')) {
            fullText += '\n';
          }
        }

        return true;
      });
    }

    console.log('构建的检查文本:', fullText);
    console.log('文本部分映射:', textParts);

    if (!fullText.trim()) {
      toast.info('没有可检查的文本内容');

      return [];
    }

    // 显示检查范围的提示
    const rangeInfo = checkRange
      ? !selection.empty
        ? `选中文本 (${fullText.length} 字符)`
        : checkRange.to - checkRange.from < doc.content.size
          ? `当前段落 (${fullText.length} 字符)`
          : `整个文档 (${fullText.length} 字符)`
      : '整个文档';

    toast.loading(`AI正在检查${rangeInfo}...`, { id: 'spell-check-progress' });

    // 为AI接口设置完整的错误处理回调
    const response = await AiApi.CorrectText(
      { text: fullText },
      {
        onError: (error) => {
          console.error('AI拼写检查错误:', error);
          toast.dismiss('spell-check-progress');
        },
        unauthorized: () => {
          toast.dismiss('spell-check-progress');
          toast.error('身份验证失败，请重新登录');
        },
        forbidden: () => {
          toast.dismiss('spell-check-progress');
          toast.error('没有权限使用AI拼写检查功能');
        },
        serverError: () => {
          toast.dismiss('spell-check-progress');
          toast.error('AI服务暂时不可用，请稍后再试');
        },
        networkError: () => {
          toast.dismiss('spell-check-progress');
          toast.error('网络连接失败，请检查网络连接');
        },
        default: (error: any) => {
          toast.dismiss('spell-check-progress');

          if (error?.message?.includes('timeout') || error?.message?.includes('超时')) {
            toast.error('AI分析超时，请稍后重试或检查网络连接');
          } else {
            toast.error('AI拼写检查失败，已切换到基础模式');
          }
        },
      },
    );

    toast.dismiss('spell-check-progress');

    // 如果API调用失败，response.data会是null，回退到基础模式
    if (!response.data?.data || !response.data.data.hasErrors) {
      if (response.error) {
        // API调用失败，显示降级提示并使用基础检测
        toast.warning('AI服务暂时不可用，已切换到基础检测模式');

        return detectBasicErrors();
      }

      // API调用成功但没有错误
      toast.success(`AI未发现拼写错误，${rangeInfo}看起来很棒！`);

      return [];
    }

    console.log('AI返回的数据:', response.data.data);

    const errors: SpellCheckError[] = [];
    const aiData = response.data.data;

    // 处理AI返回的数据 - 根据新的数据结构
    if (aiData.originalText && aiData.correctedText && aiData.correction) {
      const originalText = aiData.originalText;
      const correctedText = aiData.correctedText;
      const corrections = aiData.correction; // 新格式：[["错误词", "正确词"], ...]

      console.log('原始文本:', originalText);
      console.log('修正文本:', correctedText);
      console.log('修正列表:', corrections);

      // 处理新格式的corrections数组
      corrections.forEach(([wrongWord, correctWord]) => {
        console.log(`查找错误词: "${wrongWord}", 建议: "${correctWord}"`);

        // 在构建的文本中查找所有该错误词的位置
        const searchWord = wrongWord.trim();
        // 移除单词边界限制，因为中文字符不适用
        const escapedWord = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedWord, 'gi');
        let match: RegExpExecArray | null;

        console.log(`搜索词: "${searchWord}", 正则表达式: ${regex}, 在文本中搜索: "${fullText}"`);

        while ((match = regex.exec(fullText)) !== null) {
          const textFrom = match.index;
          const textTo = textFrom + match[0].length;

          console.log(`在文本中找到错误词 "${wrongWord}" 位置 ${textFrom}-${textTo}`);

          // 将文本位置转换为文档位置
          const docPosition = mapTextToDocPosition(textFrom, textTo, textParts);

          if (docPosition) {
            console.log(`转换为文档位置: ${docPosition.from}-${docPosition.to}`);

            // 验证文档位置的准确性
            const actualText = doc.textBetween(docPosition.from, docPosition.to);

            if (actualText.toLowerCase().trim() === searchWord.toLowerCase()) {
              // 获取上下文
              const contextStart = Math.max(0, textFrom - 20);
              const contextEnd = Math.min(fullText.length, textTo + 20);
              const context = fullText.slice(contextStart, contextEnd);

              errors.push({
                id: `${wrongWord}-${textFrom}`,
                word: match[0],
                position: docPosition,
                suggestions: [correctWord], // 新格式只有一个建议
                context: context,
              });
            } else {
              console.warn(`位置验证失败: 期望 "${searchWord}", 实际 "${actualText}"`);

              // 强制创建错误条目
              const contextStart = Math.max(0, textFrom - 20);
              const contextEnd = Math.min(fullText.length, textTo + 20);
              const context = fullText.slice(contextStart, contextEnd);

              errors.push({
                id: `${wrongWord}-${textFrom}`,
                word: actualText || match[0],
                position: docPosition,
                suggestions: [correctWord],
                context: context,
              });

              console.log('强制创建错误条目:', {
                word: actualText || match[0],
                position: docPosition,
                suggestions: [correctWord],
              });
            }
          } else {
            console.warn(`无法找到错误词 "${wrongWord}" 的文档位置`);
          }
        }
      });
    }

    // 成功检测到错误时显示提示
    if (errors.length > 0) {
      toast.success(`AI在${rangeInfo}中检测到 ${errors.length} 个拼写错误`);
    }

    console.log('最终返回的错误数组:', errors);
    console.log('错误数组长度:', errors.length);

    return errors;
  }, [editor, getCheckScopeInfo]);

  // 改进的文本位置到文档位置映射函数
  const mapTextToDocPosition = useCallback(
    (
      textFrom: number,
      textTo: number,
      textParts: { text: string; start: number; end: number }[],
    ) => {
      let currentTextOffset = 0;

      for (const part of textParts) {
        const partTextStart = currentTextOffset;
        const partTextEnd = currentTextOffset + part.text.length;

        // 检查错误词是否在当前文本部分中
        if (textFrom >= partTextStart && textFrom < partTextEnd) {
          const relativeStart = textFrom - partTextStart;
          const relativeEnd = Math.min(textTo - partTextStart, part.text.length);

          // 确保不会超出当前部分的边界
          if (relativeEnd > 0 && relativeStart < part.text.length) {
            return {
              from: part.start + relativeStart,
              to: part.start + relativeEnd,
            };
          }
        }

        currentTextOffset = partTextEnd;

        // 跳过可能的换行符
        if (currentTextOffset < textFrom) {
          currentTextOffset += 1; // 换行符占位
        }
      }

      return null;
    },
    [],
  );

  // 基础的错误检测（API失败时的备用方案）
  const detectBasicErrors = useCallback(() => {
    console.log('API失败，使用基础检测模式');

    // 只在API完全不可用时作为最后的后备方案
    // 这里只提供最基本的错误检测，主要目的是确保系统可用性
    // 实际的拼写检查应该完全依赖后端AI服务
    toast.info('AI服务暂时不可用，请稍后重试');

    return [];
  }, []);

  // 初始化时检测错误
  useEffect(() => {
    const checkSpelling = async () => {
      setIsChecking(true);
      setAllErrorsProcessed(false);
      console.log('开始初始化拼写检查...');

      try {
        const detectedErrors = await detectSpellErrors();
        console.log('检测到的错误:', detectedErrors);
        console.log('设置错误数组，长度:', detectedErrors.length);

        setErrors(detectedErrors);
        setCurrentErrorIndex(0);

        // 强制触发状态更新
        setTimeout(() => {
          console.log('强制状态更新检查');
          setIsChecking(false);
        }, 100);
      } catch (error) {
        console.error('拼写检查失败:', error);

        // 如果AI检查失败，使用基础模式作为后备
        const doc = editor.state.doc;
        const fullText = doc.textBetween(0, doc.content.size, '\n');

        if (fullText.trim()) {
          const basicErrors = detectBasicErrors();
          setErrors(basicErrors);
          setCurrentErrorIndex(0);
        }

        setIsChecking(false);
      } finally {
        // 确保状态始终被设置为 false
        setTimeout(() => {
          setIsChecking(false);
        }, 50);
      }
    };

    checkSpelling();
  }, [detectSpellErrors, editor, detectBasicErrors]);

  // 为了调试，添加一个状态日志
  useEffect(() => {
    console.log('SpellCheckPanel 状态更新:', {
      isChecking,
      errorsCount: errors.length,
      currentErrorIndex,
      currentError,
      checkScopeInfo,
    });
  }, [isChecking, errors.length, currentErrorIndex, currentError, checkScopeInfo]);

  // 当检测到错误时，确保面板保持显示
  useEffect(() => {
    if (errors.length > 0 && !isChecking) {
      console.log('检测到错误，确保面板保持显示');
      // 这里可以添加逻辑确保Popover保持打开状态
    }
  }, [errors.length, isChecking]);

  const handleAcceptSuggestion = useCallback(
    (suggestion: string) => {
      if (!currentError) return;

      console.log('准备替换:', {
        word: currentError.word,
        position: currentError.position,
        suggestion: suggestion,
      });

      // 验证位置是否仍然有效
      const doc = editor.state.doc;

      if (currentError.position.to > doc.content.size) {
        toast.error('文档已发生变化，请重新检测');

        return;
      }

      // 获取当前位置的文本来验证 - 改进的验证逻辑
      const currentText = doc.textBetween(currentError.position.from, currentError.position.to);
      console.log('当前位置的文本:', `"${currentText}"`);
      console.log('期望的错误词:', `"${currentError.word}"`);

      // 使用更准确的文本匹配验证
      const normalizedCurrent = currentText.trim();
      const normalizedError = currentError.word.trim();

      if (normalizedCurrent.toLowerCase() !== normalizedError.toLowerCase()) {
        console.warn('文本验证失败，尝试智能重新定位...');

        // 尝试在附近区域查找正确的位置
        const searchRange = 10; // 在前后10个字符范围内查找
        const searchStart = Math.max(0, currentError.position.from - searchRange);
        const searchEnd = Math.min(doc.content.size, currentError.position.to + searchRange);
        const searchText = doc.textBetween(searchStart, searchEnd);

        const wordIndex = searchText.toLowerCase().indexOf(normalizedError.toLowerCase());

        if (wordIndex >= 0) {
          // 找到了正确位置，更新位置信息
          const newFrom = searchStart + wordIndex;
          const newTo = newFrom + normalizedError.length;

          console.log('重新定位成功:', { from: newFrom, to: newTo });

          // 更新当前错误的位置
          currentError.position = { from: newFrom, to: newTo };
        } else {
          toast.warning('错误词位置已变化，请重新检测...');

          return;
        }
      }

      console.log('开始执行替换...');

      try {
        // 先选中文本，然后替换
        editor
          .chain()
          .focus()
          .setTextSelection({ from: currentError.position.from, to: currentError.position.to })
          .run();

        // 稍等一下确保选择生效，然后插入新内容
        setTimeout(() => {
          editor.chain().insertContent(suggestion).run();

          console.log('替换执行完成');

          // 显示成功提示
          toast.success(`已将 "${currentError.word}" 修正为 "${suggestion}"`);

          // 移除当前错误，跳转到下一个错误
          setTimeout(() => {
            const newErrors = errors.filter((error) => error.id !== currentError.id);
            setErrors(newErrors);

            if (newErrors.length > 0) {
              // 还有其他错误，跳转到下一个
              const nextIndex = Math.min(currentErrorIndex, newErrors.length - 1);
              setCurrentErrorIndex(nextIndex);
              toast.info(`已修正 1 个错误，还有 ${newErrors.length} 个错误待处理`);
            } else {
              // 所有错误已处理完成，保持面板打开并显示完成状态
              setCurrentErrorIndex(0);
              setAllErrorsProcessed(true);
              toast.success('🎉 所有拼写错误已修正完成！', {
                description: '面板将保持打开，您可以手动关闭或重新检查',
                duration: 4000,
              });
            }
          }, 200);
        }, 50);
      } catch (error) {
        console.error('替换失败:', error);
        toast.error('替换失败，请重试');
      }
    },
    [currentError, editor, errors, currentErrorIndex],
  );

  const handleIgnore = useCallback(() => {
    if (!currentError) return;

    const newErrors = errors.filter((error) => error.id !== currentError.id);
    setErrors(newErrors);

    if (newErrors.length > 0) {
      const nextIndex = Math.min(currentErrorIndex, newErrors.length - 1);
      setCurrentErrorIndex(nextIndex);
      toast.info(`已忽略 "${currentError.word}"，还有 ${newErrors.length} 个错误待处理`);
    } else {
      setCurrentErrorIndex(0);
      setAllErrorsProcessed(true);
      toast.success('🎉 所有错误已处理完成！', {
        description: '面板将保持打开，您可以手动关闭或重新检查',
        duration: 4000,
      });
    }
  }, [currentError, errors, currentErrorIndex]);

  const handleIgnoreAll = useCallback(() => {
    if (!currentError) return;

    const ignoredCount = errors.filter((error) => error.word === currentError.word).length;
    const newErrors = errors.filter((error) => error.word !== currentError.word);
    setErrors(newErrors);

    if (newErrors.length > 0) {
      const nextIndex = Math.min(currentErrorIndex, newErrors.length - 1);
      setCurrentErrorIndex(nextIndex);
      toast.info(
        `已忽略所有 "${currentError.word}" (${ignoredCount} 处)，还有 ${newErrors.length} 个错误待处理`,
      );
    } else {
      setCurrentErrorIndex(0);
      setAllErrorsProcessed(true);
      toast.success('🎉 所有错误已处理完成！', {
        description: '面板将保持打开，您可以手动关闭或重新检查',
        duration: 4000,
      });
    }
  }, [currentError, errors, currentErrorIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentErrorIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentErrorIndex((prev) => Math.min(errors.length - 1, prev + 1));
  }, [errors.length]);

  const handleRunSpellCheck = useCallback(async () => {
    setIsChecking(true);
    setAllErrorsProcessed(false);

    // 更新检查范围信息
    const scopeInfo = getCheckScopeInfo();
    setCheckScopeInfo(scopeInfo);

    toast.loading(`AI正在重新分析${scopeInfo}...`, { id: 'spell-check' });

    // 使用AI API重新检测错误
    const newErrors = await detectSpellErrors();
    setErrors(newErrors);
    setCurrentErrorIndex(0);

    toast.dismiss('spell-check');
    setIsChecking(false);
  }, [detectSpellErrors, getCheckScopeInfo]);

  // 高亮当前错误词 - 改进的高亮逻辑
  useEffect(() => {
    if (currentError && editor) {
      try {
        console.log('高亮错误词:', currentError);

        const { from, to } = currentError.position;
        const doc = editor.state.doc;

        // 验证位置是否有效
        if (to <= doc.content.size && from >= 0) {
          // 获取实际文本进行验证
          const actualText = doc.textBetween(from, to);
          console.log('高亮位置的实际文本:', `"${actualText}"`);

          // 验证文本是否匹配
          if (actualText.toLowerCase().trim() === currentError.word.toLowerCase().trim()) {
            // 使用 setTimeout 确保编辑器状态稳定后再设置选区
            setTimeout(() => {
              editor.chain().focus().setTextSelection({ from, to }).run();

              console.log('已选中错误词位置:', { from, to });
            }, 100);
          } else {
            console.warn('文本不匹配，尝试重新定位...');

            // 尝试在附近查找正确位置
            const searchRange = 20;
            const searchStart = Math.max(0, from - searchRange);
            const searchEnd = Math.min(doc.content.size, to + searchRange);
            const searchText = doc.textBetween(searchStart, searchEnd);

            const wordIndex = searchText.toLowerCase().indexOf(currentError.word.toLowerCase());

            if (wordIndex >= 0) {
              const newFrom = searchStart + wordIndex;
              const newTo = newFrom + currentError.word.length;

              // 验证新位置
              const newActualText = doc.textBetween(newFrom, newTo);

              if (newActualText.toLowerCase() === currentError.word.toLowerCase()) {
                setTimeout(() => {
                  editor.chain().focus().setTextSelection({ from: newFrom, to: newTo }).run();

                  console.log('重新定位并选中错误词:', { from: newFrom, to: newTo });
                }, 100);
              }
            }
          }
        } else {
          console.warn('错误词位置超出文档范围:', { from, to, docSize: doc.content.size });
        }
      } catch (error) {
        console.warn('高亮错误词失败:', error);
      }
    }
  }, [currentError, editor]);

  // 强制显示检查中状态，即使没有错误
  if (isChecking) {
    return (
      <Surface
        className="fixed top-4 right-4 p-4 w-80 max-w-sm animate-in slide-in-from-top-2 duration-200 shadow-lg z-[100000]"
        data-spell-check-panel
        style={{ position: 'fixed', zIndex: 100000 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">拼写检查</h3>
          <Toolbar.Button onClick={onClose} className="h-6 w-6">
            <Icon name="X" className="h-4 w-4" />
          </Toolbar.Button>
        </div>

        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto mb-4">
            <Icon name="RotateCw" className="w-full h-full animate-spin text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI正在智能分析文档...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">这可能需要几秒钟时间</p>
          {checkScopeInfo && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
              检查范围: {checkScopeInfo}
            </p>
          )}
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>
      </Surface>
    );
  }

  if (errors.length === 0) {
    return (
      <Surface
        className="fixed top-4 right-4 p-4 w-80 max-w-sm animate-in slide-in-from-top-2 duration-200 shadow-lg z-[100000]"
        data-spell-check-panel
        style={{ position: 'fixed', zIndex: 100000 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">拼写检查</h3>
          <Toolbar.Button onClick={onClose} className="h-6 w-6">
            <Icon name="X" className="h-4 w-4" />
          </Toolbar.Button>
        </div>

        {/* 检查范围信息 */}
        {checkScopeInfo && (
          <div className="mb-3 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Icon name="Target" className="h-3 w-3" />
            <span>检查范围: {checkScopeInfo}</span>
          </div>
        )}

        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 text-green-500 animate-in zoom-in duration-300">
            <Icon name="Check" className="w-full h-full" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {allErrorsProcessed ? '🎉 所有拼写错误已处理完成！' : 'AI未发现拼写错误'}
          </p>
          {allErrorsProcessed && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              面板将保持打开，您可以手动关闭或重新检查文档
            </p>
          )}

          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRunSpellCheck();
              }}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isChecking ? (
                <>
                  <Icon name="RotateCw" className="h-4 w-4 animate-spin" />
                  <span>AI检查中</span>
                  <span className="animate-pulse">...</span>
                </>
              ) : (
                <>
                  <Icon name="Search" className="h-4 w-4" />
                  {allErrorsProcessed ? 'AI重新检查' : 'AI重新检查'}
                </>
              )}
            </button>
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      className="fixed top-4 right-4 p-4 w-80 max-w-sm animate-in slide-in-from-top-2 duration-200 shadow-lg z-[100000]"
      data-spell-check-panel
      style={{ position: 'fixed', zIndex: 100000 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">AI拼写检查</h3>
          <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
            AI
          </div>
        </div>
        <Toolbar.Button onClick={onClose} className="h-6 w-6">
          <Icon name="X" className="h-4 w-4" />
        </Toolbar.Button>
      </div>

      {/* 检查范围信息 */}
      {checkScopeInfo && (
        <div className="mb-3 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Icon name="Target" className="h-3 w-3" />
          <span>检查范围: {checkScopeInfo}</span>
        </div>
      )}

      {/* 进度指示器 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <span>
            {currentErrorIndex + 1} / {errors.length}
          </span>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentErrorIndex + 1) / errors.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-1">
          <Toolbar.Button
            onClick={handlePrevious}
            disabled={currentErrorIndex === 0}
            className="h-6 w-6 hover:scale-110 transition-transform disabled:hover:scale-100"
          >
            <Icon name="ChevronLeft" className="h-3 w-3" />
          </Toolbar.Button>
          <Toolbar.Button
            onClick={handleNext}
            disabled={currentErrorIndex === errors.length - 1}
            className="h-6 w-6 hover:scale-110 transition-transform disabled:hover:scale-100"
          >
            <Icon name="ChevronRight" className="h-3 w-3" />
          </Toolbar.Button>
        </div>
      </div>

      {currentError && (
        <div className="space-y-4">
          {/* 错误词汇和上下文 */}
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={'AlertCircle' as any} className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="font-medium text-sm text-red-700 dark:text-red-300">
                AI发现拼写错误
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {currentError.context.split(currentError.word).map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < currentError.context.split(currentError.word).length - 1 && (
                    <span className="bg-red-200 dark:bg-red-800 px-1 py-0.5 rounded font-medium animate-pulse">
                      {currentError.word}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* 修正建议 */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon name="Lightbulb" className="h-4 w-4 text-yellow-500" />
              AI建议修正:
            </h4>
            <div className="space-y-1">
              {currentError.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAcceptSuggestion(suggestion);
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleIgnore();
              }}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              忽略
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleIgnoreAll();
              }}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              全部忽略
            </button>
          </div>
        </div>
      )}

      {/* 底部操作 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRunSpellCheck();
          }}
          disabled={isChecking}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isChecking ? (
            <>
              <Icon name="RotateCw" className="h-4 w-4 animate-spin" />
              <span>AI检查中</span>
              <span className="animate-pulse">...</span>
            </>
          ) : (
            <>
              <Icon name="Search" className="h-4 w-4" />
              AI重新检查
            </>
          )}
        </button>
      </div>
    </Surface>
  );
};
