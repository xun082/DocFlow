import React from 'react';
import { Pie, PieChart, Cell } from 'recharts';

import { CHART_CONSTANTS, COLORS } from '../constants';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  // ChartLegend,
  // ChartLegendContent,
} from '@/components/ui/chart';

interface PieChartComponentProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  yAxisKeys?: string[];
  title?: string;
  colorKey: string;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
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
      <PieChart accessibilityLayer data={data} margin={CHART_CONSTANTS.MARGIN}>
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* <ChartLegend content={<ChartLegendContent />} /> */}
        <Pie data={data} dataKey={yAxisKeys[0]} nameKey={xAxisKey} label isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry[xAxisKey]}`}
              fill={COLORS[colorKey][index % COLORS[colorKey].length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

export default PieChartComponent;
