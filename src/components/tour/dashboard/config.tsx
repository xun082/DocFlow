import { type StepType } from '../use-tour';

import { STORAGE_KEYS } from '@/utils/storage';
import { NAV_ITEMS } from '@/utils/constants/navigation';

// 本地存储 key（用于记录引导是否完成）
export const DASHBOARD_TOUR_KEY = STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED;

/**
 * 从 NAV_ITEMS 自动生成 Tour 步骤配置
 * 通过 href 属性定位元素
 */
export function generateTourSteps(): StepType[] {
  return NAV_ITEMS.filter((item) => item.tourContent).map((item) => {
    // 通过 href 属性定位，适用于 <a> 和 Next.js <Link> 渲染后的 <a>
    // 转义 href 中的特殊字符以用于 CSS 选择器
    const escapedHref = item.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 匹配精确的 href 或以其开头的 href（用于子路由）
    // 例如: '/dashboard' 匹配 '/dashboard' 和 '/dashboard/xxx'
    return {
      selector: `nav a[href="${escapedHref}"], nav a[href^="${escapedHref}/"]`,
      content: item.tourContent,
      placement: 'right',
    };
  });
}

// Tour 步骤配置（从 NAV_ITEMS 自动生成）
export const tourSteps: StepType[] = generateTourSteps();
