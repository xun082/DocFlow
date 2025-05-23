import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts';

import { ChartConfig } from './ChartBlock';

import { Icon } from '@/components/ui/Icon';

// 预设主题配置
const CHART_THEMES = {
  light: { backgroundColor: '#ffffff', textColor: '#333333' },
  dark: { backgroundColor: '#1a1a1a', textColor: '#ffffff' },
  vintage: { backgroundColor: '#fef8f4', textColor: '#8b4513' },
  macarons: { backgroundColor: '#f8f9fa', textColor: '#495057' },
  roma: { backgroundColor: '#fdf6e3', textColor: '#586e75' },
  shine: { backgroundColor: '#001529', textColor: '#ffffff' },
};

// 图表类型配置
const CHART_TYPES = [
  { type: 'bar', name: '柱状图', icon: 'BarChart3', color: 'bg-blue-500' },
  { type: 'line', name: '折线图', icon: 'TrendingUp', color: 'bg-green-500' },
  { type: 'pie', name: '饼图', icon: 'PieChart', color: 'bg-purple-500' },
  { type: 'scatter', name: '散点图', icon: 'ChartScatter', color: 'bg-orange-500' },
  { type: 'radar', name: '雷达图', icon: 'Radar', color: 'bg-pink-500' },
  { type: 'gauge', name: '仪表盘', icon: 'Gauge', color: 'bg-indigo-500' },
] as const;

// 生成ECharts配置的辅助函数
const generateChartOption = (config: ChartConfig) => {
  const { type, title, data } = config;

  // 简化的基础配置，确保图表能显示
  if (type === 'bar') {
    return {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {},
      xAxis: {
        data: data.map((item) => item.name),
      },
      yAxis: {},
      series: [
        {
          name: '数值',
          type: 'bar',
          data: data.map((item) => item.value),
          itemStyle: {
            color: '#5470c6',
          },
        },
      ],
    };
  }

  // 简化的饼图配置
  if (type === 'pie') {
    return {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: '50%',
          data: data.map((item) => ({
            value: item.value,
            name: item.name,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  // 默认返回柱状图
  return {
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {},
    xAxis: {
      data: data.map((item) => item.name),
    },
    yAxis: {},
    series: [
      {
        name: '数值',
        type: 'bar',
        data: data.map((item) => item.value),
        itemStyle: {
          color: '#5470c6',
        },
      },
    ],
  };
};

export const ChartBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [configInput, setConfigInput] = useState('');
  const [activeTab, setActiveTab] = useState<'type' | 'data' | 'theme'>('type');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const { config } = node.attrs as { config: ChartConfig };

  // 初始化图表
  useEffect(() => {
    if (chartRef.current && !isEditing) {
      // 添加延迟确保DOM完全渲染
      const timer = setTimeout(() => {
        if (!chartRef.current) return;

        try {
          // 清除之前的实例
          if (chartInstance.current) {
            chartInstance.current.dispose();
            chartInstance.current = null;
          }

          // 检查容器大小
          const rect = chartRef.current.getBoundingClientRect();

          if (rect.width === 0 || rect.height === 0) {
            console.warn('Chart container has zero dimensions');

            return;
          }

          // 创建新实例
          chartInstance.current = echarts.init(chartRef.current);

          const option = generateChartOption(config);
          console.log('Chart option:', option); // 调试信息

          // 添加动画效果
          chartInstance.current.setOption(option, true);

          // 响应式处理
          const handleResize = () => {
            chartInstance.current?.resize();
          };

          window.addEventListener('resize', handleResize);

          // 清理函数中移除事件监听器
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        } catch (error) {
          console.error('Chart initialization error:', error);
        }
      }, 100); // 100ms延迟

      return () => {
        clearTimeout(timer);
      };
    }
  }, [config, isEditing]);

  // 清理图表实例
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  // 更新图表类型
  const handleTypeChange = useCallback(
    (newType: ChartConfig['type']) => {
      const newConfig = { ...config, type: newType };
      updateAttributes({ config: newConfig });
    },
    [config, updateAttributes],
  );

  // 更新主题
  const handleThemeChange = useCallback(
    (newTheme: ChartConfig['theme']) => {
      const newConfig = { ...config, theme: newTheme };
      updateAttributes({ config: newConfig });
    },
    [config, updateAttributes],
  );

  // 开始编辑
  const handleEdit = useCallback(() => {
    setConfigInput(JSON.stringify(config, null, 2));
    setIsEditing(true);
    setErrorMessage('');
  }, [config]);

  // 保存配置
  const handleSave = useCallback(() => {
    try {
      const newConfig = JSON.parse(configInput);

      if (newConfig && typeof newConfig === 'object') {
        updateAttributes({ config: newConfig });
        setIsEditing(false);
        setErrorMessage('');
      } else {
        setErrorMessage('配置格式错误，请检查JSON结构');
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      setErrorMessage('JSON格式错误，请检查语法');
    }
  }, [configInput, updateAttributes]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setConfigInput('');
    setErrorMessage('');
  }, []);

  // 删除图表
  const handleDelete = useCallback(() => {
    if (confirm('确定要删除这个图表吗？')) {
      editor.commands.deleteSelection();
    }
  }, [editor]);

  // 预设数据示例
  const sampleConfigs = {
    sales: {
      type: 'bar' as const,
      title: '月度销售额',
      theme: 'macarons' as const,
      data: [
        { name: '1月', value: 2400 },
        { name: '2月', value: 1398 },
        { name: '3月', value: 9800 },
        { name: '4月', value: 3908 },
        { name: '5月', value: 4800 },
        { name: '6月', value: 3800 },
      ],
    },
    performance: {
      type: 'radar' as const,
      title: '团队能力评估',
      theme: 'dark' as const,
      data: [
        { name: '技术能力', value: 85 },
        { name: '沟通协作', value: 90 },
        { name: '创新思维', value: 78 },
        { name: '执行力', value: 88 },
        { name: '学习能力', value: 92 },
      ],
    },
  };

  return (
    <NodeViewWrapper className={`chart-block ${selected ? 'ProseMirror-selectednode' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg relative"
      >
        {/* 工具栏 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Icon name={'BarChart3' as any} className="h-5 w-5 text-blue-600" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-700">📊 {config.title}</span>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${CHART_TYPES.find((t) => t.type === config.type)?.color || 'bg-gray-400'}`}
              ></div>
              <span className="text-xs text-gray-500">
                {CHART_TYPES.find((t) => t.type === config.type)?.name || config.type}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              disabled={isEditing}
            >
              <Icon name="Settings" className="h-3 w-3 mr-1" />
              配置
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateAttributes({ config: sampleConfigs.sales })}
              className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Icon name="Zap" className="h-3 w-3 mr-1" />
              示例
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <Icon name="Trash2" className="h-3 w-3 mr-1" />
              删除
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-gray-50"
            >
              {/* 配置选项卡 */}
              <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border">
                {[
                  { key: 'type', label: '图表类型', icon: 'BarChart3' },
                  { key: 'data', label: '数据配置', icon: 'Database' },
                  { key: 'theme', label: '主题样式', icon: 'Palette' },
                ].map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 px-4 py-2 text-sm rounded-md transition-all ${
                      activeTab === tab.key
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={tab.icon as any} className="h-4 w-4 mr-2 inline" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'type' && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {CHART_TYPES.map((chartType) => (
                      <motion.button
                        key={chartType.type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTypeChange(chartType.type)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          config.type === chartType.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 ${chartType.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}
                        >
                          <Icon name={chartType.icon as any} className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-700">{chartType.name}</div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'theme' && (
                  <motion.div
                    key="theme"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {Object.entries(CHART_THEMES).map(([themeKey, themeValue]) => (
                      <motion.button
                        key={themeKey}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleThemeChange(themeKey as ChartConfig['theme'])}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          config.theme === themeKey
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-md mb-2"
                          style={{ backgroundColor: themeValue.backgroundColor }}
                        />
                        <div className="text-sm font-medium text-gray-700 capitalize">
                          {themeKey}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'data' && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        JSON配置 (高级编辑)
                      </label>
                      <textarea
                        value={configInput}
                        onChange={(e) => setConfigInput(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入图表配置的JSON格式..."
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateAttributes({ config: sampleConfigs.sales })}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        加载销售示例
                      </button>
                      <button
                        onClick={() => updateAttributes({ config: sampleConfigs.performance })}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                      >
                        加载雷达示例
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  <Icon name={'AlertCircle' as any} className="h-4 w-4 mr-2 inline" />
                  {errorMessage}
                </motion.div>
              )}

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Icon name="X" className="h-4 w-4 mr-1" />
                  取消
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Icon name="Check" className="h-4 w-4 mr-1" />
                  保存
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative"
            >
              <div
                ref={chartRef}
                className="w-full h-96"
                style={{ background: CHART_THEMES[config.theme || 'macarons'].backgroundColor }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选中状态的边框高亮 */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none shadow-lg"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </NodeViewWrapper>
  );
};
