'use client';

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Star, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailPasswordLogin, useEmailPasswordRegister } from '@/hooks/useAuth';

// 该页面使用客户端路由参数与动画，强制动态以避免预渲染报错
export const dynamic = 'force-dynamic';

export default function EmailPasswordLoginPage() {
  const router = useRouter();
  const emailPasswordMutation = useEmailPasswordLogin();
  const registerMutation = useEmailPasswordRegister();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // 登录表单
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loggingInRef = useRef(false);

  // 注册表单
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const regSubmittingRef = useRef(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // 提交中状态（统一引用）
  const isLoginSubmitting = emailPasswordMutation.isPending || loggingInRef.current;
  const isRegisterSubmitting = registerMutation.isPending || regSubmittingRef.current;

  useEffect(() => setMounted(true), []);

  // 获取重定向地址：优先 query，其次 sessionStorage，默认 /dashboard
  const redirectUrl = useMemo(() => {
    if (!mounted) return '/dashboard';

    let redirectTo: string | null = null;

    try {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        redirectTo = sp.get('redirect_to');
      }
    } catch {}

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
  }, [mounted]);

  // 登录提交
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('请输入邮箱和密码');

      return;
    }

    if (emailPasswordMutation.isPending || loggingInRef.current) {
      return;
    }

    loggingInRef.current = true;

    emailPasswordMutation.mutate(
      { email, password, redirectUrl },
      {
        onSuccess: () => {
          // 成功保持锁定，避免连续提交
        },
        onError: () => {
          // 错误处理已在 useEmailPasswordLogin 内完成，这里只释放锁
          loggingInRef.current = false;
        },
      },
    );
  };

  // 注册提交（前端校验 + 交互，成功后切换到登录）
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 简单校验
    if (!regEmail || !regPassword || !regConfirm) {
      toast.warning('请完整填写注册信息');

      return;
    }

    if (regPassword.length < 6) {
      toast.warning('密码长度至少为 6 位');

      return;
    }

    if (regPassword !== regConfirm) {
      toast.warning('两次输入的密码不一致');

      return;
    }

    if (registerMutation.isPending || regSubmittingRef.current) {
      return;
    }

    regSubmittingRef.current = true;

    registerMutation.mutate(
      { email: regEmail, password: regPassword, confirmPassword: regConfirm, redirectUrl },
      {
        onSuccess: () => {
          router.replace(redirectUrl);
        },
        onError: () => {
          regSubmittingRef.current = false;
        },
      },
    );
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
        </div>
      }
    >
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
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'reverse',
              }}
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

        {/* 顶部切换按钮 */}
        <div className="relative z-10 pt-10 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-1">
            <Button
              variant="ghost"
              className={`px-6 py-2 rounded-full text-sm ${
                activeTab === 'login'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('login')}
              disabled={isLoginSubmitting || isRegisterSubmitting}
            >
              登录
            </Button>
            <Button
              variant="ghost"
              className={`px-6 py-2 rounded-full text-sm ${
                activeTab === 'register'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('register')}
              disabled={isLoginSubmitting || isRegisterSubmitting}
            >
              注册
            </Button>
          </div>
        </div>

        {/* 主卡片区域：根据 activeTab 切换显示 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 min-h-screen flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg">
            {/* 登录卡片 */}
            {activeTab === 'login' && (
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
                    ></motion.div>

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
                    onSubmit={handleLoginSubmit}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-gray-300 font-medium">
                        邮箱地址
                      </Label>
                      <div className="flex items-center gap-3">
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

                    <div className="space-y-3 ">
                      <Label htmlFor="password" className="text-gray-300 font-medium">
                        密码
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入密码"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          aria-label={showLoginPassword ? '隐藏密码' : '显示密码'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                          onClick={() => setShowLoginPassword((v) => !v)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: isLoginSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isLoginSubmitting ? 1 : 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="relative group"
                    >
                      {/* 按钮发光效果 */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                      <Button
                        type="submit"
                        className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isLoginSubmitting}
                        onClick={(e) => {
                          if (isLoginSubmitting) {
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
                          <span>登录</span>
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
                        disabled={isLoginSubmitting}
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
                </motion.div>
              </motion.div>
            )}

            {/* 注册卡片 */}
            {activeTab === 'register' && (
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
                    ></motion.div>

                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-3"
                    >
                      邮箱密码注册
                    </motion.h1>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="text-lg text-gray-300 font-light"
                    >
                      请输入您的邮箱和密码完成注册
                    </motion.p>
                  </motion.div>

                  {/* 表单 */}
                  <motion.form
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="reg-email" className="text-gray-300 font-medium">
                        邮箱地址
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="请输入邮箱地址"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="reg-password" className="text-gray-300 font-medium">
                        设置密码
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="请输入密码（至少 6 位）"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          aria-label={showRegPassword ? '隐藏密码' : '显示密码'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                          onClick={() => setShowRegPassword((v) => !v)}
                        >
                          {showRegPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="reg-confirm" className="text-gray-300 font-medium">
                        确认密码
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-confirm"
                          type={showRegConfirm ? 'text' : 'password'}
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="请再次输入密码"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 pr-10 transition-all duration-300 focus:bg-white/15 focus:border-violet-400"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          aria-label={showRegConfirm ? '隐藏密码' : '显示密码'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                          onClick={() => setShowRegConfirm((v) => !v)}
                        >
                          {showRegConfirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: isRegisterSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isRegisterSubmitting ? 1 : 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="relative group"
                    >
                      {/* 按钮发光效果 */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                      <Button
                        type="submit"
                        className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white border-0 rounded-2xl py-6 px-6 text-lg font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isRegisterSubmitting}
                        onClick={(e) => {
                          if (isRegisterSubmitting) {
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
                          {registerMutation.isPending || regSubmittingRef.current ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span>注册中...</span>
                            </>
                          ) : (
                            <>
                              <span>注册</span>
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
                        disabled={isRegisterSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回登录页
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* 加载遮罩（注册中） */}
                  {(registerMutation.isPending || regSubmittingRef.current) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                      <span className="ml-2 text-white/80">注册中...</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Suspense>
  );
}
