import { InputWrapper } from './input-wrapper';

interface CodeInputProps {
  countdown: number;
  isSending: boolean;
  onSendCode: () => void;
  register?: any;
  error?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  countdown,
  isSending,
  onSendCode,
  register,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-1.5">验证码</label>
    <div className="flex gap-2.5">
      <div className="flex-1">
        <InputWrapper>
          <input
            {...(register ? register('code') : {})}
            type="text"
            placeholder="6位数字验证码"
            maxLength={6}
            className="w-full bg-transparent text-base px-3.5 py-3 rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-500"
          />
        </InputWrapper>
      </div>
      <button
        type="button"
        onClick={onSendCode}
        disabled={countdown > 0 || isSending}
        className="flex-shrink-0 w-[140px] sm:w-[150px] px-4 py-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-violet-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-gray-900 shadow-sm disabled:hover:bg-white disabled:hover:border-gray-300 text-center"
      >
        {isSending ? '发送中...' : countdown > 0 ? `${countdown}秒` : '获取验证码'}
      </button>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
);
