'use client';

import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import js_beautify from 'js-beautify';
import * as XLSX from 'xlsx';

import BarChartComponent from './components/BarChartComponent';
import LineChartComponent from './components/LineChartComponent';
import AreaChartComponent from './components/AreaChartComponent';
import PieChartComponent from './components/PieChartComponent';
import { CHART_CONSTANTS, COLORS } from './constants';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当节点属性变化时，重置表单默认值
  const form = useForm<ChartFormValues>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      title: title || '',
      chartType: type,
      xKey: xAxisKey || '',
      yAxisKeys: yAxisKeys || [],
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

  // 处理Excel文件导入
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 将工作表转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          // 更新表单数据
          form.setValue('chartData', JSON.stringify(jsonData, null, 2));

          // 自动设置第一个非数字键为X轴
          const nonNumericKeys = getNonNumericKeys(jsonData);

          if (nonNumericKeys.length > 0) {
            form.setValue('xKey', nonNumericKeys[0]);
          }

          // 自动设置第一个数字键为Y轴
          const numericKeys = getNumericKeys(jsonData);

          if (numericKeys.length > 0) {
            form.setValue('yAxisKeys', [numericKeys[0]]);
          }
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('导入Excel文件失败，请检查文件格式');
      }
    };

    reader.readAsArrayBuffer(file);

    // 重置文件输入，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 从数据中提取非数字值的键
  const getNonNumericKeys = (chartData: any[]) => {
    if (!chartData || chartData.length === 0) return [];

    // 获取第一个数据项的所有键
    const allKeys = Object.keys(chartData[0]);

    // 筛选出值不是数字的键
    return allKeys.filter((key) => {
      const value = chartData[0][key];

      // 检查值是否为数字（包括字符串形式的数字）
      return isNaN(Number(value)) || value === null || value === undefined || value === '';
    });
  };

  // 从数据中提取数字值的键
  const getNumericKeys = (chartData: any[]) => {
    if (!chartData || chartData.length === 0) return [];

    // 获取第一个数据项的所有键
    const allKeys = Object.keys(chartData[0]);

    // 筛选出值是数字的键
    return allKeys.filter((key) => {
      const value = chartData[0][key];

      // 检查值是否为数字（包括字符串形式的数字）
      return !isNaN(Number(value)) && value !== null && value !== undefined && value !== '';
    });
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
      <div className="h-full w-full">{children}</div>
    );

    try {
      switch (type) {
        case CHART_CONSTANTS.CHART_TYPES.BAR:
          return (
            <ChartWrapper>
              <BarChartComponent
                data={data}
                xAxisKey={xAxisKey || ''}
                yAxisKeys={yAxisKeys || []}
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
                yAxisKeys={yAxisKeys || []}
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
                yAxisKeys={yAxisKeys || []}
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
                yAxisKeys={yAxisKeys || []}
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
    <NodeViewWrapper
      className="chart-extension"
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
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
                variant="ghost"
                size="icon"
                className="m-4"
                title="编辑图表"
                onClick={() => {
                  // 每次打开对话框时都重置表单为最新数据
                  form.reset({
                    title: title || '',
                    chartType: type,
                    xKey: xAxisKey || '',
                    yAxisKeys: yAxisKeys ? [...yAxisKeys] : [],
                    colorKey: colorKey || 'red',
                    chartData: JSON.stringify(data, null, 2),
                  });
                }}
              >
                <Icon name="Settings" className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[640px] max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>编辑图表数据</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-3 py-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelImport}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[80px_1fr] items-center gap-4">
                          <FormLabel className="whitespace-nowrap">标题</FormLabel>
                          <FormControl>
                            <input
                              {...field}
                              className="h-9 border rounded px-3"
                              placeholder="图表标题"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chartType"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[80px_1fr] items-center gap-4">
                          <FormLabel className="whitespace-nowrap">图表类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="选择类型" />
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
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="xKey"
                      render={({ field }) => {
                        let nonNumericKeys: string[] = [];

                        try {
                          const chartData = JSON.parse(form.getValues('chartData'));

                          nonNumericKeys = getNonNumericKeys(chartData);
                        } catch {
                          // ignore
                        }

                        return (
                          <FormItem className="grid grid-cols-[80px_1fr] items-center gap-4">
                            <FormLabel className="whitespace-nowrap">X 轴</FormLabel>
                            <div className="flex flex-wrap gap-3">
                              {nonNumericKeys.length > 0 ? (
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="flex flex-wrap gap-4"
                                >
                                  {nonNumericKeys.map((key) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                      <RadioGroupItem value={key} id={key} />
                                      <label htmlFor={key} className="text-sm cursor-pointer">
                                        {key}
                                      </label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              ) : (
                                <span className="text-sm text-muted-foreground">请先输入数据</span>
                              )}
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="yAxisKeys"
                      render={({ field }) => {
                        let availableKeys: string[] = [];

                        try {
                          const chartData = JSON.parse(form.getValues('chartData'));

                          if (chartData && chartData.length > 0) {
                            const xKey = form.getValues('xKey');
                            availableKeys = Object.keys(chartData[0]).filter((key) => key !== xKey);
                          }
                        } catch {
                          // ignore
                        }

                        return (
                          <FormItem className="grid grid-cols-[80px_1fr] items-center gap-4">
                            <FormLabel className="whitespace-nowrap">Y 轴</FormLabel>
                            <div className="flex flex-wrap gap-4">
                              {availableKeys.length > 0 ? (
                                availableKeys.map((key) => (
                                  <div key={key} className="flex items-center gap-1.5">
                                    <Checkbox
                                      id={`y-${key}`}
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
                                          field.onChange(currentValues.filter((v) => v !== key));
                                        }
                                      }}
                                    />
                                    <label htmlFor={`y-${key}`} className="text-sm cursor-pointer">
                                      {key}
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">请先输入数据</span>
                              )}
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="colorKey"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-[80px_1fr] items-center gap-4">
                          <FormLabel className="whitespace-nowrap">颜色</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="选择颜色" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(COLORS).map((colorKey) => (
                                <SelectItem key={colorKey} value={colorKey}>
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 mr-2 rounded-full"
                                      style={{ backgroundColor: COLORS[colorKey][5] }}
                                    />
                                    {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="chartData"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>数据</FormLabel>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-1.5"
                            >
                              <Icon name="Upload" className="w-4 h-4" />
                              导入Excel
                            </Button>
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
                                } catch {
                                  // ignore
                                }
                              }}
                            >
                              格式化 JSON
                            </Button>
                          </div>
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-[180px] w-full resize-none font-mono text-sm"
                            placeholder='[{"name": "Jan", "value": 100}, ...]'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => form.handleSubmit(handleSave)()}>保存</Button>
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
