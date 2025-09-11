// 图表常量配置
export const CHART_CONSTANTS = {
  // 图表类型
  CHART_TYPES: {
    BAR: 'bar',
    LINE: 'line',
    AREA: 'area',
    PIE: 'pie',
  },

  // 图表高度
  HEIGHT: 300,

  // 图表边距
  MARGIN: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 60,
  },

  // X轴配置
  X_AXIS: {
    tickMargin: 10,
  },

  // 柱状图配置
  BAR: {
    radius: 4,
  },

  // 线图配置
  LINE: {
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 6,
  },

  // 饼图配置
  PIE: {
    outerRadius: 80,
    centerPosition: '50%',
  },

  // 基于 neutral 色调的配色方案
  COLORS: [
    '#404040', // neutral-700 作为主色
    '#525252', // neutral-600
    '#737373', // neutral-500
    '#a3a3a3', // neutral-400
    '#e5e5e5', // neutral-200
  ],
};

// 定义颜色对象的类型

export const COLORS: any = {
  red: [
    '#ffebee',
    '#ffcdd2',
    '#ef9a9a',
    '#e57373',
    '#ef5350',
    '#f44336',
    '#e53935',
    '#d32f2f',
    '#c62828',
    '#b71c1c',
    '#ff8a80',
    '#ff5252',
    '#ff1744',
    '#d50000',
  ],
  orange: [
    '#fff3e0',
    '#ffe0b2',
    '#ffcc80',
    '#ffb74d',
    '#ffa726',
    '#ff9800',
    '#fb8c00',
    '#f57c00',
    '#ef6c00',
    '#e65100',
    '#ffd180',
    '#ffab40',
    '#ff9100',
    '#ff6d00',
  ],
  yellow: [
    '#fffde7',
    '#fff9c4',
    '#fff59d',
    '#fff176',
    '#ffee58',
    '#ffeb3b',
    '#fdd835',
    '#fbc02d',
    '#f9a825',
    '#f57f17',
    '#ffff8d',
    '#ffff00',
    '#ffea00',
    '#ffd600',
  ],
  green: [
    '#e8f5e9',
    '#c8e6c9',
    '#a5d6a7',
    '#81c784',
    '#66bb6a',
    '#4caf50',
    '#43a047',
    '#388e3c',
    '#2e7d32',
    '#1b5e20',
    '#b9f6ca',
    '#69f0ae',
    '#00e676',
    '#00c853',
  ],
  blue: [
    '#e3f2fd',
    '#bbdefb',
    '#90caf9',
    '#64b5f6',
    '#42a5f5',
    '#2196f3',
    '#1e88e5',
    '#1976d2',
    '#1565c0',
    '#0d47a1',
    '#82b1ff',
    '#448aff',
    '#2979ff',
    '#2962ff',
  ],
  pink: [
    '#fce4ec',
    '#f8bbd0',
    '#f48fb1',
    '#f06292',
    '#ec407a',
    '#e91e63',
    '#d81b60',
    '#c2185b',
    '#ad1457',
    '#880e4f',
    '#ff80ab',
    '#ff4081',
    '#f50057',
    '#c51162',
  ],
};

export default CHART_CONSTANTS;
