import { ImageRun, TextRun } from 'docx';
import type { Run } from 'docx';
// 导入 emojibase 完整数据
import emojiData from 'emojibase-data/en/data.json';

import { EmojiNode } from '../types';

// 内存缓存，避免重复下载
const emojiCache = new Map<string, Uint8Array>();

// 配置常量
const FETCH_TIMEOUT = 5000; // 5秒超时
const MAX_RETRIES = 2; // 最多重试2次
const RETRY_DELAY = 1000; // 重试延迟1秒

/**
 * 带超时的fetch
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 带重试机制的fetch
 */
async function fetchWithRetry(url: string, maxRetries: number, delay: number): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT);

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Emoji CDN 下载失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, error);

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Emoji CDN 下载失败');
}

/**
 * 将 Tiptap 的 Emoji 节点转换为 Word 图片
 * @param name Tiptap 传出的 emoji name (如 "face_with_peeking_eye")
 * @param char 可选的原始字符 (如 "🫣")
 */
export async function convertEmoji(node: EmojiNode): Promise<Run> {
  try {
    // 1. 在 emojibase 中寻找匹配项
    // 匹配短代码名或标签
    let entry = emojiData.find(
      (item) =>
        item.shortcodes?.some((code) => code.toLowerCase() === node?.attrs?.name?.toLowerCase()) ||
        item.tags?.some(
          (tag) => tag.toLowerCase().replace(/\s+/g, '_') === node?.attrs?.name?.toLowerCase(),
        ),
    );

    if (!entry) {
      console.warn(`未找到名为 ${node?.attrs?.name} 的 Emoji 数据`);

      return new TextRun({
        text: `[emoji]: ${node?.attrs?.name || ''}`,
        size: 20,
        color: '999999',
      });
    }

    // 2. 格式化 Hexcode (Google Noto 规则：下划线连接)
    const hex = entry.hexcode.toLowerCase().replace(/-/g, '_');

    // 3. 检查缓存
    if (emojiCache.has(hex)) {
      return createImgRun(emojiCache.get(hex)!);
    }

    // 4. 构造图片链接 (使用 Google Noto CDN)
    // 注意：如果是较新的 Emoji (如 peeking eye)，确保 CDN 源是最新的
    const imageUrl = `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/png/512/emoji_u${hex}.png`;

    // 5. 下载图片（带超时和重试机制）
    const response = await fetchWithRetry(imageUrl, MAX_RETRIES, RETRY_DELAY);
    if (!response.ok) throw new Error(`CDN 下载失败: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 6. 存入缓存并返回
    emojiCache.set(hex, uint8Array);

    return createImgRun(uint8Array);
  } catch (error) {
    console.error(`Emoji [${node?.attrs?.name}] 转换失败:`, error);

    return new TextRun({
      text: `[emoji]: ${node?.attrs?.name || ''}`,
      size: 20,
      color: '999999',
    });
  }
}

function createImgRun(data: Uint8Array): ImageRun {
  return new ImageRun({
    data: data,
    type: 'png',
    transformation: {
      width: 20,
      height: 20,
    },
  });
}
