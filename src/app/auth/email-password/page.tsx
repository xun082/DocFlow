'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordLogin } from '@/hooks/useAuth';

export default function EmailPasswordLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailPasswordMutation = useEmailPasswordLogin();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 使用 ref 追踪请求状态，防止重复请求
  const loggingInRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // 获取重定向地址：优先 query，其次 sessionStorage，默认 /dashboard
  const redirectUrl = useMemo(() => {
    if (!mounted) return '/dashboard';

    const redirectTo = searchParams?.get('redirect_to');

    if (redirectTo) {
      try {
        return decodeURIComponent(redirectTo);
      } catch {
        return '/dashboard';
      }
    }

    try {
      const saved = sessionStorage.getItem('auth_redirect');
      if (saved) return saved;
    } catch {}

    return '/dashboard';
  }, [searchParams, mounted]);

  // 提交登录
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 简单校验
    if (!email || !password) {
      toast.warning('请输入邮箱和密码');

      return;
    }

    // 双重检查防重复提交
    if (emailPasswordMutation.isPending || loggingInRef.current) {
      return;
    }

    // 立即设置 ref 锁
    loggingInRef.current = true;

    emailPasswordMutation.mutate(
      { email, password, redirectUrl },
      {
        onSuccess: () => {
          // 保持锁定，避免连续提交
        },
        onError: () => {
          // 错误处理已在 useEmailPasswordLogin 内完成，这里只释放锁
          loggingInRef.current = false;
        },
        onSettled: () => {
          // 成功保持锁定；失败在 onError 中已释放
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen relative overflow-hidden bg-black"
    >
      {/* 背景动效（与邮箱验证码页一致） */}
      <div className="absolute inset-0">
        {/* 主色光晕 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.2 }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
            className="w-full h-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
              delay: 2,
            }}
            className="w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse',
              delay: 1,
            }}
            className="w-full h-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full"
          />
        </motion.div>

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      {/* 漂浮星星元素 */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: [0, 1, 0], y: -100 }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5, ease: 'linear' }}
            className="absolute"
            style={{ left: `${15 + i * 15}%`, top: '100%' }}
          >
            <Star className="w-3 h-3 text-white/20" />
          </motion.div>
        ))}
      </motion.div>

      {/* 主卡片 */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 min-h-screen flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative group"
          >
            {/* 发光边框 */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(45deg, #8b5cf6, #a855f7, #d946ef)',
                  'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  'linear-gradient(225deg, #ec4899, #a855f7, #06b6d4)',
                  'linear-gradient(315deg, #8b5cf6, #ec4899, #3b82f6)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"
            />

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 hover:shadow-3xl hover:border-white/15 transition-all duration-500"
            >
              {/* 头部 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mb-8"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl mb-6 shadow-lg cursor-pointer"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-3"
                >
                  邮箱密码登录
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg text-gray-300 font-light"
                >
                  请输入您的邮箱和密码
                </motion.p>
              </motion.div>

              {/* 表单 */}
              <motion.form
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    邮箱地址
                  </Label>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱地址"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    密码
                  </Label>
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-white/50" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{
                    scale: emailPasswordMutation.isPending || loggingInRef.current ? 1 : 1.02,
                  }}
                  whileTap={{
                    scale: emailPasswordMutation.isPending || loggingInRef.current ? 1 : 0.98,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative group"
                >
                  {/* 按钮发光效果 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                  <Button
                    type="submit"
                    className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={emailPasswordMutation.isPending || loggingInRef.current}
                    onClick={(e) => {
                      if (emailPasswordMutation.isPending || loggingInRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative flex items-center justify-center space-x-3">
                      {emailPasswordMutation.isPending || loggingInRef.current ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>登录中...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-6 h-6" />
                          <span>登录</span>
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
              </motion.form>

              {/* 返回按钮 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="mt-6 text-center"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="link"
                    className="text-gray-400 hover:text-white transition-colors duration-300 p-0 cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => router.push('/auth')}
                    disabled={emailPasswordMutation.isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回登录页
                  </Button>
                </motion.div>
              </motion.div>

              {/* 安全提示 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 2 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center justify-center space-x-2 text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>为了你的账户安全，请勿在不可信设备保存密码</span>
                </div>
              </motion.div>

              {/* 加载遮罩（登录中） */}
              {(emailPasswordMutation.isPending || loggingInRef.current) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <span className="ml-2 text-white/80">登录中...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
