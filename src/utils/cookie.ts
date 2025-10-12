/**
 * 设置cookie
 * @param name cookie名称
 * @param value cookie值
 * @param days 过期天数
 */
export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // 添加 SameSite=Lax 确保 cookie 在刷新时不会丢失
  // Secure 在 HTTPS 环境下启用
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * 获取cookie值
 * @param name cookie名称
 * @returns cookie值
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();

    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }

  return null;
}

/**
 * 删除cookie
 * @param name cookie名称
 */
export function removeCookie(name: string) {
  setCookie(name, '', -1);
}

/**
 * 保存认证信息到cookie（仅使用cookie，不使用localStorage）
 * @param authData 认证数据
 */
export function saveAuthData(authData: {
  token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}) {
  if (typeof window === 'undefined') return;

  // 计算过期天数，默认7天
  const expiryDays = authData.expires_in ? Math.ceil(authData.expires_in / 86400) : 7;

  // 只保存到cookie
  if (authData.token) {
    setCookie('auth_token', authData.token, expiryDays);
  }

  if (authData.refresh_token) {
    const refreshExpiryDays = authData.refresh_expires_in
      ? Math.ceil(authData.refresh_expires_in / 86400)
      : 30;
    setCookie('refresh_token', authData.refresh_token, refreshExpiryDays);
  }

  if (authData.expires_in) {
    setCookie('expires_in', authData.expires_in.toString(), expiryDays);
  }

  if (authData.refresh_expires_in) {
    setCookie('refresh_expires_in', authData.refresh_expires_in.toString(), expiryDays);
  }

  // 保存一个时间戳，用于验证token是否过期
  const timestamp = Date.now().toString();
  setCookie('auth_timestamp', timestamp, expiryDays);
}

/**
 * 获取认证token（仅从cookie获取）
 * @returns token字符串或null
 */
export function getAuthToken(): string | null {
  return getCookie('auth_token');
}

/**
 * 验证token是否存在且有效
 * @returns boolean
 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();

  return !!(token && token.length > 0 && token !== 'undefined' && token !== 'null');
}

/**
 * 清除认证数据（仅清除cookies）
 */
export function clearAuthData() {
  removeCookie('auth_token');
  removeCookie('refresh_token');
  removeCookie('expires_in');
  removeCookie('refresh_expires_in');
  removeCookie('auth_timestamp');
}
