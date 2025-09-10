import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

import { CHART_CONSTANTS, colors } from '../constants';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface LineChartComponentProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  yAxisKeys?: string[]; // 支持多个Y轴键
  title?: string;
  colorKey: string; // 单个颜色（向后兼容）
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
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
        color: colors[colorKey][index],
      };

      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart accessibilityLayer data={data} margin={CHART_CONSTANTS.MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={CHART_CONSTANTS.X_AXIS.tickMargin}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {yAxisKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[colorKey][index]}
            strokeWidth={CHART_CONSTANTS.LINE.strokeWidth}
            dot={{
              r: CHART_CONSTANTS.LINE.dotRadius,
              fill: colors[colorKey][index],
            }}
            activeDot={{
              r: CHART_CONSTANTS.LINE.activeDotRadius,
              fill: colors[colorKey][index],
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};

export default LineChartComponent;
