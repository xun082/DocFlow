import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface NoPermissionProps {
  documentTitle?: string;
  message?: string;
}

export default function NoPermission({ documentTitle, message }: NoPermissionProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-red-100 dark:bg-red-950 rounded-full p-6">
                <ShieldX className="w-16 h-16 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-3">
            无法访问文档
          </h1>

          {/* 描述信息 */}
          <div className="text-center space-y-2 mb-8">
            {documentTitle && (
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                文档：<span className="text-slate-900 dark:text-slate-100">{documentTitle}</span>
              </p>
            )}
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {message || '您没有访问此文档的权限。如需访问，请联系文档所有者获取权限。'}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/docs">
                <Home className="w-4 h-4 mr-2" />
                返回文档列表
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              如果您认为这是一个错误，请联系系统管理员
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
