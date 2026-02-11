/**
 * URL 安全验证工具函数
 */

/** 允许的安全协议列表 */
const SAFE_PROTOCOLS = ['http:', 'https:'];

/**
 * 验证 URL 是否使用安全协议（http / https）
 * 防止 javascript: 等恶意协议导致的 XSS 攻击
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 安全地在新标签页打开 URL
 * 仅在 URL 通过安全验证时才执行 window.open
 */
export function safeOpenUrl(url: string | undefined | null): void {
  if (isSafeUrl(url)) {
    window.open(url!, '_blank', 'noopener,noreferrer');
  }
}
