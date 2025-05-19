/**
 * 光标颜色集合 - 精心挑选的颜色，确保良好的对比度和辨识度
 */
const CURSOR_COLORS = [
  '#5D8AA8', // 钢青色
  '#E32636', // 鲜红色
  '#FF8C00', // 深橙色
  '#9932CC', // 深兰花紫
  '#00FF7F', // 春绿色
  '#FF1493', // 深粉红色
  '#7B68EE', // 中紫色
  '#FFD700', // 金色
  '#008080', // 鸭绿色
  '#FF4500', // 橙红色
  '#4682B4', // 钢蓝色
  '#6A5ACD', // 板岩蓝色
  '#32CD32', // 石灰绿色
  '#FF69B4', // 热粉红色
  '#CD5C5C', // 印度红色
  '#4169E1', // 品蓝色
  '#8A2BE2', // 紫罗兰色
  '#3CB371', // 中海绿色
  '#7CFC00', // 草地绿色
  '#BA55D3', // 中兰花紫色
  '#E6E6FA', // 薰衣草色
  '#800000', // 栗色
  '#9370DB', // 中紫色
  '#ADFF2F', // 绿黄色
];

/**
 * 获取随机光标颜色
 * @returns 返回一个随机的光标颜色
 */
export function getRandomCursorColor(): string {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

/**
 * 根据用户ID获取确定的光标颜色
 * 同一个用户ID总是获得相同的颜色
 * @param userId 用户ID
 * @returns 返回与用户ID对应的颜色
 */
export function getCursorColorByUserId(userId: string): string {
  // 将用户ID转换为数字(使用简单的哈希方法)
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // 使用哈希值确定颜色索引
  const colorIndex = hash % CURSOR_COLORS.length;

  return CURSOR_COLORS[colorIndex];
}

/**
 * 获取所有可用的光标颜色
 * @returns 返回所有光标颜色的数组
 */
export function getAllCursorColors(): string[] {
  return [...CURSOR_COLORS];
}
