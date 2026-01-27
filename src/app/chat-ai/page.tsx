'use client';

/**
 * AI 聊天页面
 *
 * 功能说明：
 * - 左侧侧边栏：模型参数配置 + 聊天历史记录
 * - 右侧聊天区：支持单模型或多模型对比
 * - 添加对比模型后，聊天区域会分栏显示
 *
 * 状态管理：
 * - modelConfigs: 当前所有模型配置（主模型 + 对比模型）
 * - inputValues: 各模型的输入框内容
 * - sessions: 聊天会话列表
 * - activeSessionId: 当前激活的会话 ID
 */

import React, { useState, useCallback } from 'react';

import { ChatSidebar, ChatAIPanels } from './_components';
import { createModelConfig, INITIAL_PRIMARY_MODEL } from './constants';
import type { ModelConfig, ChatSession } from './types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

export default function ChatAIPage() {
  // 模型配置列表：第一个是主模型，后续是对比模型
  // 使用固定的初始配置避免 SSR/客户端 Hydration 不一致
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([INITIAL_PRIMARY_MODEL]);

  // 输入框内容：以模型 id 为 key
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 聊天会话列表（模拟数据）
  // 使用固定时间戳避免 SSR 和客户端 Hydration 不一致
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: '如何学习 React',
      createdAt: new Date('2026-01-25T10:00:00'),
      lastMessageAt: new Date('2026-01-27T09:00:00'),
      messageCount: 5,
    },
    {
      id: '2',
      title: 'TypeScript 最佳实践',
      createdAt: new Date('2026-01-26T10:00:00'),
      lastMessageAt: new Date('2026-01-27T09:30:00'),
      messageCount: 3,
    },
  ]);

  // 当前激活的会话 ID
  const [activeSessionId, setActiveSessionId] = useState<string>('1');

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
   * 更新对比模型配置（仅对比模式下存在）
   */
  const handleCompareConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => (prev.length > 1 ? [prev[0], newConfig, ...prev.slice(2)] : prev));
  }, []);

  /**
   * 取消模型对比，仅保留主模型
   */
  const handleCancelCompare = useCallback(() => {
    setModelConfigs((prev) => prev.slice(0, 1));
  }, []);

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

  /**
   * 会话点击
   */
  const handleSessionClick = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    console.log('切换到会话:', sessionId);
    // TODO: 加载会话消息
  }, []);

  /**
   * 新建会话
   */
  const handleNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新会话',
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    console.log('新建会话:', newSession.id);
  }, []);

  /**
   * 删除会话
   */
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (activeSessionId === sessionId) {
        setActiveSessionId(sessions[0]?.id || '');
      }

      console.log('删除会话:', sessionId);
    },
    [activeSessionId, sessions],
  );

  return (
    <div className="flex h-full">
      {/* ----- 左侧侧边栏 ----- */}
      <ChatSidebar
        config={primaryConfig}
        onConfigChange={handleConfigChange}
        onAddCompareModel={handleAddCompareModel}
        canAddCompareModel={canAddCompareModel}
        isCompareMode={isCompareMode}
        compareConfig={isCompareMode ? modelConfigs[1]! : null}
        onCompareConfigChange={handleCompareConfigChange}
        onCancelCompare={handleCancelCompare}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionClick={handleSessionClick}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* ----- 右侧聊天区域 ----- */}
      <div className={`flex flex-1 min-w-0 ${isCompareMode ? 'gap-0' : ''}`}>
        {modelConfigs.map((config, index) => (
          <ChatAIPanels
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
