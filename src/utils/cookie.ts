/**
 * 设置cookie
 * @param name cookie名称
 * @param value cookie值
 * @param days 过期天数
 */
export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
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
 * 保存认证信息到cookie
 * @param authData 认证数据
 */
export function saveAuthData(authData: {
  token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}) {
  if (authData.token) {
    setCookie('auth_token', authData.token);
  }

  if (authData.refresh_token) {
    setCookie('refresh_token', authData.refresh_token);
  }

  if (authData.expires_in) {
    setCookie('expires_in', authData.expires_in.toString());
  }

  if (authData.refresh_expires_in) {
    setCookie('refresh_expires_in', authData.refresh_expires_in.toString());
  }
}

/**
 * 清除认证数据
 */
export function clearAuthData() {
  removeCookie('auth_token');
  removeCookie('refresh_token');
  removeCookie('expires_in');
  removeCookie('refresh_expires_in');
}
