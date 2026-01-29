import { Activity } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

import { CodeInput } from '@/components/ui/code-input';
import { LoginFormData } from '@/utils/auth-schemas';

interface EmailCodeLoginFormProps {
  isActive: boolean;
  countdown: number;
  isSending: boolean;
  onSendCode: () => void;
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

export const EmailCodeLoginForm = ({
  isActive,
  countdown,
  isSending,
  onSendCode,
  register,
  errors,
}: EmailCodeLoginFormProps) => (
  <Activity mode={isActive ? 'visible' : 'hidden'}>
    <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
      <CodeInput
        countdown={countdown}
        isSending={isSending}
        onSendCode={onSendCode}
        register={register}
        error={errors.code?.message}
      />
    </div>
  </Activity>
);
