export interface ActionButtonConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

// 不再需要 createActionButtons，所有按钮配置都移除
export const createActionButtons = (): ActionButtonConfig[] => {
  return [];
};
