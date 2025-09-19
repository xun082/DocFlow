'use client';

import { Badge } from '@/components/ui/badge';

interface Task {
  status: 'pending' | 'progress' | 'completed' | 'failed';
  progress?: number;
  jobId?: string;
}

interface PodcastTaskListProps {
  tasks: Map<string, Task>;
}

export const PodcastTaskList = ({ tasks }: PodcastTaskListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">简历转播客列表</h2>
        <span className="text-sm text-gray-500">共 {tasks.size} 个任务</span>
      </div>

      {/* 空状态处理 */}
      {tasks.size === 0 ? (
        <div className="py-10 text-center">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">暂无播客任务</p>
          <p className="text-gray-400 text-sm mt-1">上传文件后将显示任务进度</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...tasks].map(([jobId, task]) => (
            <div
              key={jobId}
              className="p-4 border border-gray-100 rounded-lg transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-500 text-sm">状态：</p>
                    <Badge
                      className={`
                        ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : task.status === 'failed'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }
                        transition-all duration-300
                      `}
                    >
                      {task.status === 'completed'
                        ? '已完成'
                        : task.status === 'failed'
                          ? '失败'
                          : task.status === 'pending'
                            ? '等待中'
                            : '处理中'}
                    </Badge>
                  </div>

                  {task.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-gray-500 text-sm">进度：</p>
                        <p className="text-sm font-medium">{task.progress}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`
                            h-2.5 rounded-full transition-all duration-1000 ease-out
                            ${
                              task.status === 'completed'
                                ? 'bg-green-500'
                                : task.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                            }
                          `}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  {task.jobId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">任务ID：</span>
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[100px]">
                        {task.jobId.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
