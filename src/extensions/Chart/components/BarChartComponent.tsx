import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { CHART_CONSTANTS, COLORS } from '../constants';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface BarChartComponentProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  yAxisKeys?: string[]; // 支持多个Y轴键
  title?: string;
  colorKey: string; // 单个颜色（向后兼容）
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  xAxisKey = '',
  yAxisKeys = [],
  colorKey,
}) => {
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
      <BarChart
        accessibilityLayer
        data={data}
        margin={CHART_CONSTANTS.MARGIN}
        onClick={(e) => console.log(e)}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={CHART_CONSTANTS.X_AXIS.tickMargin}
          axisLine={false}
        />
        <YAxis />
        <ChartLegend content={<ChartLegendContent />} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        {yAxisKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[colorKey][index % COLORS[colorKey].length]}
            radius={CHART_CONSTANTS.BAR.radius}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default BarChartComponent;
