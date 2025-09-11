import React from 'react';
import { Pie, PieChart } from 'recharts';

import { CHART_CONSTANTS, COLORS } from '../constants';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface PieChartComponentProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  yAxisKeys?: string[]; // 支持多个Y轴键
  title?: string;
  colorKey: string; // 单个颜色（向后兼容）
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  xAxisKey = '',
  yAxisKeys = [],
  colorKey,
}) => {
  // 如果没有提供yAxisKeys，则使用yAxisKey作为默认键

  // 创建 chartConfig
  const chartConfig = yAxisKeys.reduce(
    (acc, key, index) => {
      acc[key] = {
        label: key,
        color: COLORS[colorKey][index % COLORS[colorKey].length], // 添加模运算防止越界
      };

      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <PieChart accessibilityLayer data={data} margin={CHART_CONSTANTS.MARGIN}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {yAxisKeys.map((key, index) => (
          <Pie
            key={key}
            data={data}
            dataKey={key}
            nameKey={xAxisKey}
            cx={CHART_CONSTANTS.PIE.centerPosition}
            cy={CHART_CONSTANTS.PIE.centerPosition}
            outerRadius={CHART_CONSTANTS.PIE.outerRadius}
            fill={COLORS[colorKey][index]}
            label
          />
        ))}
      </PieChart>
    </ChartContainer>
  );
};

export default PieChartComponent;
