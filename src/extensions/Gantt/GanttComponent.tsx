'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import type { NodeViewProps } from '@tiptap/react';

import { GanttTask } from './Gantt';
import { GanttTaskDialog } from './components/GanttTaskDialog';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const GanttComponent = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [viewMode, setViewMode] = useState<string>('Day');
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<any>(null);

  const tasks = (node.attrs.tasks as GanttTask[]) || [];

  // 转换任务格式为frappe-gantt格式
  const convertToFrappeGanttTasks = (tasks: GanttTask[]): any[] => {
    return tasks.map((task) => ({
      id: task.id,
      name: task.name,
      start: task.startDate,
      end: task.endDate,
      progress: task.progress,
      dependencies: task.dependencies || '',
      custom_class: task.color ? `task-${task.color.replace('#', '')}` : 'task-3b82f6',
    }));
  };

  // 初始化和更新甘特图
  useEffect(() => {
    if (!ganttRef.current) return;

    // 清空容器
    ganttRef.current.innerHTML = '';

    if (tasks.length === 0) return;

    try {
      const frappeGanttTasks = convertToFrappeGanttTasks(tasks);

      ganttInstanceRef.current = new Gantt(ganttRef.current, frappeGanttTasks, {
        view_mode: viewMode,
        bar_height: 35,
        bar_corner_radius: 4,
        arrow_curve: 5,
        padding: 18,
        date_format: 'YYYY-MM-DD',
        language: 'zh-CN',
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
        popup_trigger: 'click',
        auto_move_label: true,
        custom_popup_html: (task: any) => {
          const start = task._start.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
          const end = task._end.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
          const duration = Math.ceil((task._end - task._start) / (1000 * 60 * 60 * 24));

          return `
            <div class="gantt-popup-modern">
              <div class="gantt-popup-header">
                <div class="gantt-popup-title">${task.name}</div>
              </div>
              <div class="gantt-popup-body">
                <div class="popup-info-item">
                  <div class="popup-info-icon">📅</div>
                  <div class="popup-info-text">
                    <div class="popup-info-label">日期范围</div>
                    <div class="popup-info-value">${start} - ${end} (${duration} 天)</div>
                  </div>
                </div>
                <div class="popup-info-item">
                  <div class="popup-info-icon">📊</div>
                  <div class="popup-info-text">
                    <div class="popup-info-label">完成进度</div>
                    <div class="popup-progress-container">
                      <div class="popup-progress-bar">
                        <div class="popup-progress-fill" style="width: ${task.progress}%"></div>
                      </div>
                      <span class="popup-progress-text">${task.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
        on_click: (task: any) => {
          const originalTask = tasks.find((t) => t.id === task.id);

          if (originalTask) {
            handleEditTask(originalTask);
          }
        },
        on_date_change: (task: any, start: string, end: string) => {
          const startDate = new Date(start);
          const endDate = new Date(end);
          const updatedTasks = tasks.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0],
                }
              : t,
          );
          updateAttributes({ tasks: updatedTasks } as any);
        },
        on_progress_change: (task: any, progress: number) => {
          const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, progress } : t));
          updateAttributes({ tasks: updatedTasks } as any);
        },
      } as any);
    } catch (error) {
      console.error('初始化甘特图失败:', error);
    }

    return () => {
      ganttInstanceRef.current = null;
    };
  }, [tasks, viewMode]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: GanttTask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (task: GanttTask) => {
    if (editingTask) {
      // 更新现有任务
      const updatedTasks = tasks.map((t) => (t.id === task.id ? task : t));
      updateAttributes({ tasks: updatedTasks } as any);
    } else {
      // 添加新任务
      const newTask = {
        ...task,
        id: `task-${Date.now()}`,
      };
      updateAttributes({ tasks: [...tasks, newTask] } as any);
    }

    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const viewModeOptions: { label: string; value: string }[] = [
    { label: '四分之一天', value: 'Quarter Day' },
    { label: '半天', value: 'Half Day' },
    { label: '天', value: 'Day' },
    { label: '周', value: 'Week' },
    { label: '月', value: 'Month' },
    { label: '年', value: 'Year' },
  ];

  return (
    <NodeViewWrapper className="gantt-wrapper">
      <div
        className={`gantt-container rounded-xl border-2 p-5 my-5 shadow-sm transition-all ${
          selected
            ? 'border-blue-500 shadow-blue-500/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700'
        } bg-white dark:bg-gray-900`}
      >
        {/* 头部工具栏 */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950">
              <GripVertical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">甘特图</h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
              {tasks.length} 个任务
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* 视图模式切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 font-medium shadow-sm">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {viewModeOptions.find((v) => v.value === viewMode)?.label || '天'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {viewModeOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setViewMode(option.value)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTask}
              className="h-9 px-3 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              添加任务
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteNode}
              className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-medium"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 甘特图主体 */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-950/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              开始创建项目计划
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-7 max-w-md">
              使用甘特图来可视化项目时间线、跟踪任务进度，让团队协作更高效
            </p>
            <Button
              onClick={handleAddTask}
              size="lg"
              className="shadow-lg shadow-blue-500/20 h-11 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              创建第一个任务
            </Button>
          </div>
        ) : (
          <div className="gantt-content">
            {/* Frappe Gantt 容器 */}
            <div
              ref={ganttRef}
              className="frappe-gantt-container overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
              style={{ minHeight: '400px' }}
            />
          </div>
        )}
      </div>

      {/* 任务编辑对话框 */}
      <GanttTaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        allTasks={tasks}
      />
    </NodeViewWrapper>
  );
};

export default GanttComponent;
