'use client';

import { useState, useEffect } from 'react';
import { Clock, Link2 } from 'lucide-react';

import { GanttTask } from '../Gantt';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface GanttTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: GanttTask) => void;
  task: GanttTask | null;
  allTasks?: GanttTask[];
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export const GanttTaskDialog = ({
  isOpen,
  onClose,
  onSave,
  task,
  allTasks = [],
}: GanttTaskDialogProps) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState('#3b82f6');
  const [dependencies, setDependencies] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setProgress(task.progress);
      setColor(task.color || '#3b82f6');
      setDependencies(task.dependencies || '');
    } else {
      // 重置为默认值
      setName('');

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(nextWeek);
      setProgress(0);
      setColor('#3b82f6');
      setDependencies('');
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!name.trim() || !startDate || !endDate) {
      return;
    }

    // 验证日期范围
    if (new Date(endDate) < new Date(startDate)) {
      alert('结束日期不能早于开始日期');

      return;
    }

    const taskData: GanttTask = {
      id: task?.id || '',
      name: name.trim(),
      startDate,
      endDate,
      progress: Math.max(0, Math.min(100, progress)),
      color,
      dependencies: dependencies.trim(),
    };

    onSave(taskData);
  };

  const setQuickDateRange = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {task ? '编辑任务' : '创建新任务'}
          </DialogTitle>
          <DialogDescription>
            {task ? '修改任务的详细信息和时间安排' : '为项目添加新的任务，设置时间和进度'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 任务名称 */}
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-sm font-medium">
              任务名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-name"
              placeholder="例如：需求分析、UI设计、开发测试..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="text-base"
            />
          </div>

          {/* 日期范围 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                日期范围 <span className="text-red-500">*</span>
              </Label>
              {startDate && endDate && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {calculateDuration()} 天
                </Badge>
              )}
            </div>

            {/* 快捷日期选择 */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setQuickDateRange(7)}
              >
                1周
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setQuickDateRange(14)}
              >
                2周
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setQuickDateRange(30)}
              >
                1个月
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setQuickDateRange(90)}
              >
                3个月
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm">
                  开始日期
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm">
                  结束日期
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          </div>

          {/* 进度 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="progress" className="text-sm font-medium">
                完成进度
              </Label>
              <Badge
                variant={progress === 100 ? 'default' : progress >= 50 ? 'secondary' : 'outline'}
                className="text-xs font-semibold"
              >
                {progress}%
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
                }}
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-20 text-center"
              />
            </div>
            {/* 进度条预览 */}
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>

          {/* 任务依赖 */}
          {allTasks.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="dependencies" className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                任务依赖
              </Label>
              <div className="space-y-2">
                <Input
                  id="dependencies"
                  placeholder="例如：1, 2 (表示依赖任务1和任务2)"
                  value={dependencies}
                  onChange={(e) => setDependencies(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  输入任务ID，用逗号分隔。当前任务将在依赖任务完成后开始。
                </p>
                {allTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allTasks
                      .filter((t) => t.id !== task?.id)
                      .map((t) => (
                        <Badge
                          key={t.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => {
                            const deps = dependencies
                              .split(',')
                              .map((d) => d.trim())
                              .filter(Boolean);

                            if (!deps.includes(t.id)) {
                              setDependencies(deps.concat(t.id).join(', '));
                            }
                          }}
                        >
                          {t.id}: {t.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 颜色选择 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">任务颜色</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`w-9 h-9 rounded-lg transition-all hover:scale-110 shadow-sm ${
                    color === presetColor
                      ? 'ring-2 ring-offset-2 scale-110 shadow-md'
                      : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: presetColor,
                  }}
                  onClick={() => setColor(presetColor)}
                  title={presetColor}
                />
              ))}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <label
                  htmlFor="custom-color"
                  className="w-9 h-9 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: color }}
                >
                  <input
                    id="custom-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-0 h-0 opacity-0"
                  />
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">自定义</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !startDate || !endDate}>
            {task ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GanttTaskDialog;
