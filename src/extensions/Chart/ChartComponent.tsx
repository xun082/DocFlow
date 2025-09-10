'use client';

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  // Tooltip,
  // Legend,
  // ResponsiveContainer,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ChartComponentProps {
  node: {
    attrs: {
      type: 'bar' | 'line' | 'pie' | 'area';
      data: Array<Record<string, any>>;
      title?: string;
      xAxisKey: string;
      yAxisKey: string;
    };
  };
  updateAttributes: (attrs: Record<string, any>) => void;
  extension: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChartComponent: React.FC<ChartComponentProps> = ({ node }) => {
  const { type, data, title, xAxisKey, yAxisKey } = node.attrs;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ChartContainer
            config={{
              [yAxisKey]: {
                label: title || yAxisKey,
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={yAxisKey} fill="var(--color-desktop)" radius={4} />
            </BarChart>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer
            config={{
              [yAxisKey]: {
                label: title || yAxisKey,
                color: 'hsl(var(--chart-2))',
              },
            }}
            className="aspect-auto h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        );

      case 'area':
        return (
          <ChartContainer
            config={{
              [yAxisKey]: {
                label: title || yAxisKey,
                color: 'hsl(var(--chart-3))',
              },
            }}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey={yAxisKey}
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        );

      case 'pie':
        return (
          <ChartContainer
            config={{
              [yAxisKey]: {
                label: title || yAxisKey,
                color: 'hsl(var(--chart-4))',
              },
            }}
            className="aspect-auto h-[300px] w-full"
          >
            <PieChart
              accessibilityLayer
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  return (
    <NodeViewWrapper className="chart-extension">
      <Card className="w-full">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-[300px] w-full">
            {data && data.length > 0 ? (
              renderChart()
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};

export default ChartComponent;
