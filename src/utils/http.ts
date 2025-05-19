/**
 * HTTP 状态码对应的错误消息
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  200: '请求成功',
  201: '创建成功',
  202: '请求已接受',
  204: '请求成功，无返回内容',
  300: '重定向',
  301: '永久重定向',
  302: '临时重定向',
  304: '资源未修改',
  307: '临时重定向',
  308: '永久重定向',
  400: '请求参数错误',
  401: '未授权，请重新登录',
  402: '需要付费',
  403: '拒绝访问',
  404: '请求地址不存在',
  405: '请求方法不允许',
  406: '请求格式不可接受',
  407: '需要代理认证',
  408: '请求超时',
  409: '资源冲突',
  410: '资源已不存在',
  411: '需要指定长度',
  412: '请求条件不满足',
  413: '请求实体过大',
  414: '请求URL过长',
  415: '不支持的媒体类型',
  416: '请求范围不满足',
  417: '期望值不满足',
  418: '我是一个茶壶',
  422: '请求格式正确，但语义错误',
  429: '请求过于频繁',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不支持',
  507: '存储空间不足',
  508: '检测到循环',
  510: '服务器配置错误',
  511: '需要网络认证',
};

/**
 * HTTP 请求方法
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

/**
 * HTTP 请求模式
 */
export const HTTP_MODES = {
  CORS: 'cors',
  NO_CORS: 'no-cors',
  SAME_ORIGIN: 'same-origin',
} as const;

/**
 * HTTP 请求凭证模式
 */
export const HTTP_CREDENTIALS = {
  INCLUDE: 'include',
  SAME_ORIGIN: 'same-origin',
  OMIT: 'omit',
} as const;
