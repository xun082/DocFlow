'use client';

/**
 * AI 聊天页面
 *
 * 功能说明：
 * - 左侧侧边栏：模型参数配置
 * - 右侧聊天区：支持单模型或多模型对比
 * - 添加对比模型后，聊天区域会分栏显示
 *
 * 状态管理：
 * - modelConfigs: 当前所有模型配置（主模型 + 对比模型）
 * - inputValues: 各模型的输入框内容
 */

import React, { useState, useCallback } from 'react';
import { ChatSidebar, ChatPanel } from './_components';
import { createModelConfig } from './constants';
import type { ModelConfig } from './types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

export default function ChatAIPage() {
  // 模型配置列表：第一个是主模型，后续是对比模型
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([createModelConfig()]);

  // 输入框内容：以模型 id 为 key
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 主模型配置
  const primaryConfig = modelConfigs[0];

  // 是否可以添加对比模型
  const canAddCompareModel = modelConfigs.length <= MAX_COMPARE_MODELS;

  // 是否处于对比模式
  const isCompareMode = modelConfigs.length > 1;

  /**
   * 更新主模型配置
   */
  const handleConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => [newConfig, ...prev.slice(1)]);
  }, []);

  /**
   * 添加对比模型
   */
  const handleAddCompareModel = useCallback(() => {
    if (!canAddCompareModel) return;

    // 基于主模型配置创建新的对比模型
    const newModelConfig = createModelConfig({
      modelName: primaryConfig.modelName,
      maxTokens: primaryConfig.maxTokens,
      temperature: primaryConfig.temperature,
      topP: primaryConfig.topP,
      enableThinking: primaryConfig.enableThinking,
      thinkingBudget: primaryConfig.thinkingBudget,
    });

    setModelConfigs((prev) => [...prev, newModelConfig]);
  }, [canAddCompareModel, primaryConfig]);

  /**
   * 更新输入框内容
   */
  const handleInputChange = useCallback((modelId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [modelId]: value }));
  }, []);

  /**
   * 发送消息（静态页面暂不实现）
   */
  const handleSend = useCallback(
    (modelId: string) => {
      const value = inputValues[modelId] || '';
      console.log(`发送消息到模型 ${modelId}:`, value);
      // TODO: 实现实际的发送逻辑
    },
    [inputValues],
  );

  /**
   * 快捷问题点击
   */
  const handleQuickQuestionClick = useCallback((modelId: string, question: string) => {
    setInputValues((prev) => ({ ...prev, [modelId]: question }));
  }, []);

  return (
    <div className="flex h-full">
      {/* ----- 左侧侧边栏 ----- */}
      <ChatSidebar
        config={primaryConfig}
        onConfigChange={handleConfigChange}
        onAddCompareModel={handleAddCompareModel}
        canAddCompareModel={canAddCompareModel}
      />

      {/* ----- 右侧聊天区域 ----- */}
      <div className={`flex flex-1 min-w-0 ${isCompareMode ? 'gap-0' : ''}`}>
        {modelConfigs.map((config, index) => (
          <ChatPanel
            key={config.id}
            config={config}
            inputValue={inputValues[config.id] || ''}
            onInputChange={(value) => handleInputChange(config.id, value)}
            onSend={() => handleSend(config.id)}
            onQuickQuestionClick={(q) => handleQuickQuestionClick(config.id, q)}
            showBorder={isCompareMode && index > 0}
          />
        ))}
      </div>
    </div>
  );
}
