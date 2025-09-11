'use client';

import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import js_beautify from 'js-beautify';

import BarChartComponent from './components/BarChartComponent';
import LineChartComponent from './components/LineChartComponent';
import AreaChartComponent from './components/AreaChartComponent';
import PieChartComponent from './components/PieChartComponent';
import { CHART_CONSTANTS, COLORS } from './constants';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Textarea from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ChartComponentProps {
  node: {
    attrs: {
      type: keyof typeof CHART_CONSTANTS.CHART_TYPES;
      data: Array<Record<string, any>>;
      title?: string;
      xAxisKey?: string;
      yAxisKeys?: string[];
      colorKey?: string; // 添加颜色键
    };
  };
  updateAttributes: (attrs: Record<string, any>) => void;
  extension: any;
}

const chartFormSchema = z.object({
  title: z.string().optional(),
  chartType: z.enum([
    CHART_CONSTANTS.CHART_TYPES.BAR,
    CHART_CONSTANTS.CHART_TYPES.LINE,
    CHART_CONSTANTS.CHART_TYPES.AREA,
    CHART_CONSTANTS.CHART_TYPES.PIE,
  ]),
  xKey: z.string().min(1, 'X轴键不能为空'),
  yAxisKeys: z.array(z.string()).optional(),
  colorKey: z.string().optional(),
  chartData: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);

        return true;
      } catch {
        return false;
      }
    },
    {
      message: '必须是有效的JSON格式',
    },
  ),
});

type ChartFormValues = z.infer<typeof chartFormSchema>;

const ChartComponent: React.FC<ChartComponentProps> = ({ node, updateAttributes }) => {
  const { type, data, title, xAxisKey, yAxisKeys, colorKey } = node.attrs;
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ChartFormValues>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      title: title || '',
      chartType: type,
      xKey: xAxisKey || '',
      yAxisKeys: yAxisKeys ? yAxisKeys : [],
      colorKey: colorKey,
      chartData: JSON.stringify(data, null, 2),
    },
  });

  useEffect(() => {
    // 确保组件只在客户端渲染
    setIsClient(true);
  }, []);

  // 检查数据是否有效
  const isValidData = data && Array.isArray(data) && data.length > 0;

  const handleSave = (values: ChartFormValues) => {
    console.log('保存数据：', values);

    try {
      let parsedData = JSON.parse(values.chartData);

      updateAttributes({
        data: parsedData,
        title: values.title,
        xAxisKey: values.xKey,
        yAxisKeys: values.yAxisKeys || [],
        type: values.chartType,
        colorKey: values.colorKey, // 添加颜色键到图表属性
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error parsing chart data:', error);
    }
  };

  const renderChart = () => {
    // 只在客户端和有有效数据时渲染图表
    if (!isClient || !isValidData) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          {isValidData ? 'Loading chart...' : 'No data available'}
        </div>
      );
    }

    const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="h-full w-full min-h-[300px]">{children}</div>
    );

    try {
      switch (type) {
        case CHART_CONSTANTS.CHART_TYPES.BAR:
          return (
            <ChartWrapper>
              <BarChartComponent
                data={data}
                xAxisKey={xAxisKey || ''}
                yAxisKeys={node.attrs.yAxisKeys || []}
                title={title}
                colorKey={colorKey || 'red'}
              />
            </ChartWrapper>
          );

        case CHART_CONSTANTS.CHART_TYPES.LINE:
          return (
            <ChartWrapper>
              <LineChartComponent
                data={data}
                xAxisKey={xAxisKey || ''}
                yAxisKeys={node.attrs.yAxisKeys || []}
                title={title}
                colorKey={colorKey || 'red'}
              />
            </ChartWrapper>
          );

        case CHART_CONSTANTS.CHART_TYPES.AREA:
          return (
            <ChartWrapper>
              <AreaChartComponent
                data={data}
                xAxisKey={xAxisKey || ''}
                yAxisKeys={node.attrs.yAxisKeys || []}
                title={title}
                colorKey={colorKey || 'red'}
              />
            </ChartWrapper>
          );

        case CHART_CONSTANTS.CHART_TYPES.PIE:
          return (
            <ChartWrapper>
              <PieChartComponent
                data={data}
                xAxisKey={xAxisKey || ''}
                yAxisKeys={node.attrs.yAxisKeys || []}
                title={title}
                colorKey={colorKey || 'red'}
              />
            </ChartWrapper>
          );

        default:
          return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Unsupported chart type
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering chart:', error);

      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Error rendering chart
        </div>
      );
    }
  };

  return (
    <NodeViewWrapper className="chart-extension">
      <Card className="w-full">
        <div className="flex justify-between items-center">
          {title && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="m-4"
                onClick={() => {
                  form.setValue('chartData', JSON.stringify(data, null, 2));
                  form.setValue('title', title || '');
                  form.setValue('xKey', xAxisKey || '');
                  form.setValue('chartType', type);
                  form.setValue('yAxisKeys', yAxisKeys ? yAxisKeys : []);
                  form.setValue('colorKey', node.attrs.colorKey || 'red'); // 使用当前图表的colorKey，如果没有则默认为'red'
                }}
              >
                Edit Chart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl min-w-3xl">
              <DialogHeader>
                <DialogTitle>Edit Chart Data</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center gap-4">
                        <FormLabel className="text-right">Title</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="col-span-5 border rounded px-3 py-2"
                            placeholder="Chart title"
                          />
                        </FormControl>
                        <FormMessage className="col-span-6 col-start-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chartType"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center gap-4">
                        <FormLabel className="text-right">Chart Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="col-span-5">
                              <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CHART_CONSTANTS.CHART_TYPES).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                {key.charAt(0) + key.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="col-span-6 col-start-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="xKey"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center gap-4">
                        <FormLabel className="text-right">X Axis</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="col-span-5 border rounded px-3 py-2"
                            placeholder="X axis key"
                          />
                        </FormControl>
                        <FormMessage className="col-span-6 col-start-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yAxisKeys"
                    render={({ field }) => {
                      // 从chartData中解析可用的键
                      let availableKeys: string[] = [];

                      try {
                        const chartData = JSON.parse(form.getValues('chartData'));

                        if (chartData && chartData.length > 0) {
                          // 获取第一个数据项的所有键，排除xKey
                          const xKey = form.getValues('xKey');
                          availableKeys = Object.keys(chartData[0]).filter((key) => key !== xKey);
                        }
                      } catch (error) {
                        console.error('Error parsing chart data for keys:', error);
                      }

                      return (
                        <FormItem className="grid grid-cols-6 items-center gap-4">
                          <FormLabel className="text-right">Y Axis Keys</FormLabel>
                          <div className="col-span-5 flex items-center gap-2">
                            {availableKeys.length > 0 ? (
                              availableKeys.map((key) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value)
                                          ? field.value.includes(key)
                                          : false
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentValues = Array.isArray(field.value)
                                          ? [...field.value]
                                          : [];

                                        if (checked) {
                                          if (!currentValues.includes(key)) {
                                            field.onChange([...currentValues, key]);
                                          }
                                        } else {
                                          field.onChange(
                                            currentValues.filter((value) => value !== key),
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <span>{key}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                请先输入有效的图表数据
                              </div>
                            )}
                          </div>
                          <FormMessage className="col-span-6 col-start-2" />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="colorKey"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center gap-4">
                        <FormLabel className="text-right">Chart Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="col-span-5">
                              <SelectValue placeholder="Select chart color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(COLORS).map((colorKey) => (
                              <SelectItem key={colorKey} value={colorKey}>
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 mr-2 rounded-full"
                                    style={{ backgroundColor: COLORS[colorKey][5] }} // 使用索引5，而不是500
                                  />
                                  {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="col-span-6 col-start-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chartData"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center gap-4">
                        <FormLabel className="text-right">Data</FormLabel>
                        <div className="col-span-5">
                          <div className="flex justify-end mb-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                try {
                                  const beautified = js_beautify.js(field.value, {
                                    indent_size: 2,
                                    space_in_empty_paren: true,
                                  });
                                  field.onChange(beautified);
                                } catch (error) {
                                  console.error('Error formatting JSON:', error);
                                }
                              }}
                            >
                              格式化 JSON
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="h-64 font-mono text-sm"
                              placeholder='[{"name": "Jan", "value": 100}, ...]'
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="col-span-6 col-start-2" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => form.handleSubmit(handleSave)()}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent>
          <div className="h-[300px] w-full" style={{ height: `${CHART_CONSTANTS.HEIGHT}px` }}>
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};

export default ChartComponent;
