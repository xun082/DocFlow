import { Activity } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

import { InputField } from '@/components/ui/input-field';
import { LoginFormData } from '@/utils/auth-schemas';

interface RegisterFormProps {
  isActive: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

export const RegisterForm = ({
  isActive,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  register,
  errors,
}: RegisterFormProps) => (
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

    <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
      <InputField
        label="确认密码"
        name="confirmPassword"
        placeholder="请再次输入您的密码"
        showPasswordToggle
        showPassword={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
        register={register}
        error={errors.confirmPassword?.message}
      />
    </div>
  </Activity>
);
