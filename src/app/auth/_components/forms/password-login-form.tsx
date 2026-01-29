import { Activity } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

import { InputField } from '@/components/ui/input-field';
import { LoginFormData } from '@/utils/auth-schemas';

interface PasswordLoginFormProps {
  isActive: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

export const PasswordLoginForm = ({
  isActive,
  showPassword,
  onTogglePassword,
  register,
  errors,
}: PasswordLoginFormProps) => (
  <Activity mode={isActive ? 'visible' : 'hidden'}>
    <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
      <InputField
        label="密码"
        name="password"
        placeholder="请输入您的密码"
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        register={register}
        error={errors.password?.message}
      />
    </div>

    <div
      className="flex items-center justify-between text-xs sm:text-sm animate-fade-in"
      style={{ animationDelay: '500ms' }}
    >
      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
        <input
          type="checkbox"
          name="rememberMe"
          className="w-4 h-4 rounded border-gray-300 text-violet-500 focus:ring-2 focus:ring-violet-500 cursor-pointer"
        />
        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">保持登录</span>
      </label>
      <button
        type="button"
        onClick={() => toast.info('密码重置功能开发中')}
        className="text-violet-600 hover:text-violet-700 transition-colors hover:underline"
      >
        忘记密码？
      </button>
    </div>
  </Activity>
);
