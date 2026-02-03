import { useEffect, useRef } from 'react';

// 定义一个工厂函数来创建workers
const createWorker = (url: string) => {
  // 确保只在客户端执行
  if (typeof window === 'undefined') return null;

  try {
    return new Worker(new URL(url, import.meta.url), { type: 'module' });
  } catch (error) {
    console.error('Worker creation failed:', error);

    return null;
  }
};

/**
 * 创建并管理Web Worker的hook
 * @param workerUrls Worker文件URL对象的映射
 * @returns 包含Worker引用的对象
 */
export function useWorkers<T extends Record<string, string>>(workerUrls: T) {
  // 创建workers引用，类型为Record<keyof T, Worker | null>
  const workers = useRef<Record<keyof T, Worker | null>>({} as Record<keyof T, Worker | null>);

  useEffect(() => {
    // 只在客户端环境创建workers
    if (typeof window === 'undefined') return;

    // 初始化workers
    Object.entries(workerUrls).forEach(([key, url]) => {
      // 先终止现有worker（如果存在）
      workers.current[key as keyof T]?.terminate();

      // 使用工厂函数创建worker
      workers.current[key as keyof T] = createWorker(url);
    });

    // 保存当前workers的引用，以便在cleanup函数中使用
    const currentWorkers = workers.current;

    // 清理函数
    return () => {
      // 使用保存的引用而不是可能变化的workers.current
      Object.values(currentWorkers).forEach((worker) => {
        worker?.terminate();
      });
    };
  }, [workerUrls]); // 只有当URLs变化时才重新创建

  return workers.current;
}
