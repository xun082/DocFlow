'use client';

/**
 * 模型列表管理 Hook
 *
 * 功能说明：
 * - 获取可用模型列表
 * - 缓存模型列表避免重复请求
 */

import { useState, useEffect } from 'react';

import type { ModelOption } from '../types';

import { ChatAiApi } from '@/services/chat-ai';

export interface UseChatModelsResult {
  /** 模型列表选项 */
  models: ModelOption[];
  /** 是否正在加载 */
  isLoading: boolean;
}

// 模块级缓存，避免多个组件重复调用接口
let cachedModels: ModelOption[] | null = null;
let modelsPromise: Promise<void> | null = null;

/**
 * 获取可用模型列表 Hook
 */
export function useChatModels(): UseChatModelsResult {
  // 初始状态使用空数组，避免 Hydration 错误
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果已有缓存，直接使用
    if (cachedModels) {
      setModels(cachedModels);
      setIsLoading(false);

      return;
    }

    // 如果已有请求在进行中，等待完成
    if (modelsPromise) {
      modelsPromise.then(() => {
        if (cachedModels) {
          setModels(cachedModels);
        }

        setIsLoading(false);
      });

      return;
    }

    // 发起新请求
    const fetchModels = async () => {
      setIsLoading(true);

      const { data } = await ChatAiApi.ChatModels();

      if (data?.data?.list && Array.isArray(data.data.list)) {
        const options: ModelOption[] = data.data.list.map((m) => ({
          value: m.id,
          label: m.name,
        }));
        cachedModels = options;
        setModels(options);
      }

      setIsLoading(false);
    };

    modelsPromise = fetchModels();
  }, []);

  return { models, isLoading };
}
