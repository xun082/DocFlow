import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

import { MindMapNodeData } from './MindMapBlock';

import { Icon } from '@/components/ui/Icon';
import MindMap from '@/extensions/MindMapBlock/_components/mind_map';
import VideoApi from '@/services/video';

// 处理状态枚举
enum ProcessingState {
  IDLE = 'idle',
  DOWNLOADING = 'downloading',
  TRANSCRIBING = 'transcribing',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const MindMapBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [jsonInput, setJsonInput] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const { data } = node.attrs as { data: MindMapNodeData };

  // 判断是否为预览模式（有数据且不在编辑状态）
  const isPreviewMode = data && !isEditing && !isGenerating;

  // 处理状态对应的文本和进度
  const getProcessingInfo = (state: ProcessingState) => {
    switch (state) {
      case ProcessingState.DOWNLOADING:
        return { text: '正在下载视频...', progress: 25 };
      case ProcessingState.TRANSCRIBING:
        return { text: '正在转换音频为文字...', progress: 50 };
      case ProcessingState.GENERATING:
        return { text: '正在生成思维导图...', progress: 75 };
      case ProcessingState.COMPLETED:
        return { text: '生成完成！', progress: 100 };
      case ProcessingState.ERROR:
        return { text: '处理失败', progress: 0 };
      default:
        return { text: '待处理', progress: 0 };
    }
  };

  // 验证URL格式
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);

      return true;
    } catch {
      return false;
    }
  };

  // 主要的处理流程
  const handleGenerateFromUrl = useCallback(async () => {
    if (!videoUrl.trim()) {
      setErrorMessage('请输入视频URL');

      return;
    }

    if (!isValidUrl(videoUrl)) {
      setErrorMessage('请输入有效的URL格式');

      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      // 第一步：下载视频
      setProcessingState(ProcessingState.DOWNLOADING);

      const downloadResponse = await VideoApi.DownloadVideoForNetWork(
        { url: videoUrl },
        {
          onError: (error) => console.error('下载视频失败:', error),
        },
      );

      if (!downloadResponse.data?.data) {
        throw new Error('视频下载失败');
      }

      // 第二步：音频转文字
      setProcessingState(ProcessingState.TRANSCRIBING);

      const transcribeResponse = await VideoApi.AudioToText(
        {
          audioPath: downloadResponse.data.data.mp3Path,
        },
        {
          onError: (error) => console.error('音频转文字失败:', error),
        },
      );

      if (!transcribeResponse.data?.data?.transcriptionText) {
        throw new Error('音频转文字失败');
      }

      // 第三步：文字转思维导图
      setProcessingState(ProcessingState.GENERATING);

      const mindMapResponse = await VideoApi.TextToMindMap(
        {
          transcriptionText: transcribeResponse.data.data.transcriptionText,
        },
        {
          onError: (error) => console.error('思维导图生成失败:', error),
        },
      );

      if (!mindMapResponse.data?.data?.mind_map) {
        throw new Error('思维导图生成失败');
      }

      // 更新思维导图数据
      setProcessingState(ProcessingState.COMPLETED);
      updateAttributes({ data: mindMapResponse.data.data.mind_map });

      // 重置状态
      setTimeout(() => {
        setIsGenerating(false);
        setProcessingState(ProcessingState.IDLE);
        setVideoUrl('');
      }, 1500);
    } catch (error) {
      console.error('处理失败:', error);
      setProcessingState(ProcessingState.ERROR);
      setErrorMessage(error instanceof Error ? error.message : '处理失败，请重试');

      setTimeout(() => {
        setIsGenerating(false);
        setProcessingState(ProcessingState.IDLE);
      }, 3000);
    }
  }, [videoUrl, updateAttributes]);

  // 打开编辑模式
  const handleEdit = useCallback(() => {
    setJsonInput(JSON.stringify(data, null, 2));
    setIsEditing(true);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  }, [data]);

  // 保存JSON数据
  const handleSave = useCallback(() => {
    try {
      const newData = JSON.parse(jsonInput);

      if (newData && typeof newData === 'object' && newData.id && newData.label) {
        updateAttributes({ data: newData });
        setIsEditing(false);
      } else {
        setErrorMessage('数据格式错误，请检查JSON结构');
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      setErrorMessage('JSON格式错误，请检查语法');
    }
  }, [jsonInput, updateAttributes]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setJsonInput('');
    setErrorMessage('');
  }, []);

  // 重置为示例数据
  const handleReset = useCallback(() => {
    const sampleData: MindMapNodeData = {
      id: 1,
      label: '算法分类',
      children: [
        {
          id: 2,
          label: '排序算法',
          children: [
            { id: 3, label: '冒泡排序' },
            { id: 4, label: '快速排序' },
            { id: 5, label: '归并排序' },
            { id: 6, label: '堆排序' },
          ],
        },
        {
          id: 7,
          label: '搜索算法',
          children: [
            { id: 8, label: '线性搜索' },
            { id: 9, label: '二分搜索' },
            { id: 10, label: '深度优先搜索' },
            { id: 11, label: '广度优先搜索' },
          ],
        },
        {
          id: 12,
          label: '图算法',
          children: [
            { id: 13, label: 'Dijkstra算法' },
            { id: 14, label: '最小生成树' },
            { id: 15, label: '拓扑排序' },
          ],
        },
        {
          id: 16,
          label: '动态规划',
          children: [
            { id: 17, label: '背包问题' },
            { id: 18, label: '最长公共子序列' },
            { id: 19, label: '斐波那契数列' },
          ],
        },
      ],
    };

    updateAttributes({ data: sampleData });
  }, [updateAttributes]);

  // 删除当前块
  const handleDelete = useCallback(() => {
    if (confirm('确定要删除这个思维导图吗？')) {
      editor.commands.deleteSelection();
    }
  }, [editor]);

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerateFromUrl();
    }
  };

  const processingInfo = getProcessingInfo(processingState);

  return (
    <NodeViewWrapper className={`mindmap-block ${selected ? 'ProseMirror-selectednode' : ''}`}>
      <div
        className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 固定工具栏 - 始终占位，避免布局抖动 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="GitBranch" className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">思维导图</span>
          </div>

          {/* 工具栏按钮区域 */}
          <div className="flex items-center space-x-2">
            {!isPreviewMode ? (
              // 非预览模式显示所有按钮
              <>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={isEditing || isGenerating}
                >
                  <Icon name="Pencil" className="h-3 w-3 mr-1" />
                  编辑数据
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={isGenerating}
                >
                  <Icon name="RotateCcw" className="h-3 w-3 mr-1" />
                  示例数据
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  disabled={isGenerating}
                >
                  <Icon name="Trash2" className="h-3 w-3 mr-1" />
                  删除
                </button>
              </>
            ) : (
              // 预览模式下的占位空间，保持布局稳定
              <div className="h-6 w-16"></div>
            )}
          </div>
        </div>

        {/* 预览模式悬浮编辑按钮 */}
        {isPreviewMode && isHovered && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 shadow-lg"
              disabled={isEditing || isGenerating}
            >
              <Icon name="Pencil" className="h-3 w-3 mr-1" />
              编辑
            </button>
          </div>
        )}

        {/* URL输入和生成区域 - 只在非预览模式时显示 */}
        {!isPreviewMode && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                从视频URL生成思维导图
              </label>
              <div className="flex space-x-2">
                <input
                  ref={urlInputRef}
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入视频URL（支持YouTube、Bilibili等）"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerateFromUrl}
                  disabled={isGenerating || !videoUrl.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>处理中</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Icon name="Zap" className="h-4 w-4" />
                      <span>生成</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 处理进度 */}
            {isGenerating && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{processingInfo.text}</span>
                  <span className="text-sm text-gray-500">{processingInfo.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingInfo.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {errorMessage && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                <Icon name="X" className="h-4 w-4 mr-1 inline" />
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* 编辑模式 */}
        {isEditing ? (
          <div className="p-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                编辑思维导图数据 (JSON格式)
              </label>
              <textarea
                ref={textareaRef}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入JSON格式的思维导图数据..."
              />
            </div>

            {/* 数据格式说明 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">数据格式说明：</h4>
              <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                {`{
  "id": 1,
  "label": "根节点标题",
  "children": [
    {
      "id": 2,
      "label": "子节点标题",
      "children": [
        { "id": 3, "label": "叶子节点" }
      ]
    }
  ]
}`}
              </pre>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Icon name="Check" className="h-4 w-4 mr-1" />
                保存
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <Icon name="X" className="h-4 w-4 mr-1" />
                取消
              </button>
            </div>
          </div>
        ) : (
          /* 思维导图显示区域 - 优化高度设置 */
          <div className={`relative ${isPreviewMode ? 'min-h-[400px]' : 'h-80'}`}>
            {data ? (
              <MindMap data={data} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Icon name="GitBranch" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">暂无思维导图数据</p>
                  <p className="text-sm">请输入视频URL生成思维导图，或使用示例数据</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 选中状态的边框高亮 */}
        {selected && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}
      </div>
    </NodeViewWrapper>
  );
};
