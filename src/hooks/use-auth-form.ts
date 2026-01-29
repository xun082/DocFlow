import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import authApi from '@/services/auth';
import {
  LoginFormData,
  passwordLoginSchema,
  emailCodeLoginSchema,
  registerSchema,
} from '@/utils/auth-schemas';
import { LoginMode } from '@/app/auth/_components/login-mode-switcher';

export const useAuthForm = (loginMode: LoginMode) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
  });

  // 当 loginMode 改变时重置表单和错误
  useEffect(() => {
    reset();
    clearErrors();
  }, [loginMode, reset, clearErrors]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    const email = getValues('email');

    if (!email) {
      toast.error('请先输入邮箱地址');

      return;
    }

    const emailSchema = z.string().email();
    const emailValidation = emailSchema.safeParse(email);

    if (!emailValidation.success) {
      toast.error('请输入有效的邮箱地址');

      return;
    }

    setIsSendingCode(true);

    const { data, error } = await authApi.sendEmailCode(email);

    setIsSendingCode(false);

    if (error) {
      toast.error(error);

      return;
    }

    if (!data || data.code !== 200) {
      toast.error(data?.message || '发送验证码失败');

      return;
    }

    toast.success('验证码已发送', {
      description: '请查收您的邮箱，验证码有效期为10分钟',
    });

    setCountdown(60);
  };

  const getSchema = () => {
    switch (loginMode) {
      case 'password':
        return passwordLoginSchema;
      case 'email':
        return emailCodeLoginSchema;
      case 'register':
        return registerSchema;
      default:
        return emailCodeLoginSchema;
    }
  };

  return {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    countdown,
    isSendingCode,
    handleSendCode,
    register,
    handleSubmit,
    errors,
    setError,
    getSchema,
  };
};
