import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { CHART_CONSTANTS, COLORS } from '../constants';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface AreaChartComponentProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  yAxisKeys?: string[]; // 支持多个Y轴键
  title?: string;
  colorKey: string;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
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
      <AreaChart accessibilityLayer data={data} margin={CHART_CONSTANTS.MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={CHART_CONSTANTS.X_AXIS.tickMargin}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />

        {yAxisKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            fill={COLORS[colorKey][index]}
            fillOpacity={0.4}
            stroke={COLORS[colorKey][index]}
            strokeWidth={CHART_CONSTANTS.LINE.strokeWidth}
            stackId={key === yAxisKeys[0] ? '1' : undefined} // 只有第一条曲线参与堆叠
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

export default AreaChartComponent;
