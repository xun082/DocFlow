'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { Edit2, Play, Pause } from 'lucide-react';
import { format, formatISO, parseISO, isBefore, addHours } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/utils';
import { Calendar } from '@/components/ui/calendar';

// 导入flip样式
import './flip-styles.css';
import '@pqina/flip/dist/flip.min.css';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface FlipNumberProps {
  value: number;
  label: string;
  type: 'days' | 'hours' | 'minutes' | 'seconds';
}

const FlipNumber: React.FC<FlipNumberProps> = ({ value, label, type }) => {
  const flipRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  // 只在组件挂载时设置isClient
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 主要初始化逻辑 - 只在isClient变为true时执行一次
  useEffect(() => {
    if (!isClient || !flipRef.current || tickRef.current) return;

    // 动态导入 @pqina/flip 库

    import('@pqina/flip').then(({ default: Tick }) => {
      if (!flipRef.current) return;

      // 初始化Flip组件
      tickRef.current = Tick.DOM.create(flipRef.current, {
        value: value.toString().padStart(2, '0'),
      });
    });

    return () => {
      if (tickRef.current) {
        tickRef.current.destroy();
        tickRef.current = null;
      }
    };
  }, [isClient]); // 只依赖isClient

  // 值更新逻辑 - 不依赖isClient，只依赖value
  useEffect(() => {
    if (!tickRef.current) return;

    tickRef.current.value = value.toString().padStart(2, '0');
  }, [value]);

  if (!isClient) {
    return (
      <div
        className={`flip-number ${type} flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700`}
      >
        <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex  items-center">
      <div
        ref={flipRef}
        className={`tick flip-number ${type}`}
        data-repeat="true"
        data-layout="horizontal fit"
      >
        <span data-view="flip"></span>
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
};

const CountdownComponent: React.FC<ReactNodeViewProps> = ({ node, selected, updateAttributes }) => {
  const {
    targetDate,
    title = '',
    description = '',
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
  } = node.attrs;

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isEditing, setIsEditing] = useState(!targetDate);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editTargetDate, setEditTargetDate] = useState<Date | undefined>(
    targetDate ? parseISO(targetDate) : new Date(),
  );
  const [editTime, setEditTime] = useState<string>(
    targetDate ? format(parseISO(targetDate), 'HH:mm:ss') : format(new Date(), 'HH:mm:ss'),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateTimeRemaining = (target: string): TimeRemaining => {
    const targetTime = parseISO(target).getTime();
    const currentTime = new Date().getTime();
    const total = Math.max(0, targetTime - currentTime);

    if (total <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total };
  };

  const startCountdown = () => {
    if (!targetDate || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSave = () => {
    // console.log('🚀 ~ file: CountdownComponent.tsx:178 ~ editTargetDate:', editTargetDate);

    if (!editTargetDate) {
      toast.error('请选择一个目标日期');

      return;
    }

    if (!editTime) {
      // 设置默认时间为当前时间加一小时
      const now = new Date();
      const defaultTime = addHours(now, 1);
      setEditTime(format(defaultTime, 'HH:mm:ss'));
    }

    const [hours, minutes, seconds] = editTime.split(':').map(Number);
    const combinedDate = new Date(editTargetDate);
    combinedDate.setHours(hours, minutes, seconds);

    // 检查是否选择了过去的时间
    if (isBefore(combinedDate, new Date())) {
      toast.error('选择的时间小于当前时间');

      // 可以在这里添加错误提示
      return;
    }

    updateAttributes({
      title: editTitle,
      description: editDescription,
      targetDate: formatISO(combinedDate),
    });

    setIsEditing(false);
    setShowCalendar(false);
    setTimeRemaining(calculateTimeRemaining(formatISO(combinedDate)));
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDescription(description);
    setEditTargetDate(targetDate ? parseISO(targetDate) : new Date());
    setEditTime(
      targetDate ? format(parseISO(targetDate), 'HH:mm:ss') : format(new Date(), 'HH:mm:ss'),
    );
    setIsEditing(false);
    setShowCalendar(false);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startCountdown();
    } else {
      setIsPaused(true);
      stopCountdown();
    }
  };

  useEffect(() => {
    if (targetDate) {
      setTimeRemaining(calculateTimeRemaining(targetDate));
      startCountdown();
    }

    return () => {
      stopCountdown();
    };
  }, [targetDate, isPaused]);

  return (
    <NodeViewWrapper className="countdown-block">
      <Card
        className={cn(
          'w-full my-4 transition-all duration-200',
          selected && 'ring-2 ring-blue-500 ring-offset-2',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {targetDate && (
                <Button variant="ghost" size="sm" onClick={togglePause} className="h-8 w-8 p-0">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="flex justify-between items-center gap-8">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex-1">
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !editTargetDate && 'text-muted-foreground',
                        )}
                      >
                        {editTargetDate ? format(editTargetDate, 'yyyy年MM月dd日') : '选择日期'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editTargetDate}
                        onSelect={(date: Date | undefined) => {
                          setEditTargetDate(date);
                          setShowCalendar(false);
                        }}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={handleSave}>
                  保存
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  取消
                </Button>
              </div>
            </div>
          ) : null}
        </CardHeader>

        <CardContent>
          {targetDate ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {showDays && <FlipNumber value={timeRemaining.days} label="天" type="days" />}
                {showHours && <FlipNumber value={timeRemaining.hours} label="小时" type="hours" />}
                {showMinutes && (
                  <FlipNumber value={timeRemaining.minutes} label="分钟" type="minutes" />
                )}
                {showSeconds && (
                  <FlipNumber value={timeRemaining.seconds} label="秒" type="seconds" />
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};

export { CountdownComponent };
