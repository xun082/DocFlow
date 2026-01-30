import { Lock, Mail, CircleUser, LucideIcon } from 'lucide-react';

export type LoginMode = 'password' | 'email' | 'register';

interface LoginModeConfig {
  id: LoginMode;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const loginModes: LoginModeConfig[] = [
  { id: 'password', label: '密码登录', shortLabel: '密码', icon: Lock },
  { id: 'email', label: '邮箱验证码', shortLabel: '验证码', icon: Mail },
  { id: 'register', label: '用户注册', shortLabel: '注册', icon: CircleUser },
];

interface LoginModeSwitcherProps {
  currentMode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
}

export const LoginModeSwitcher = ({ currentMode, onModeChange }: LoginModeSwitcherProps) => (
  <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
    <div className="flex gap-2">
      {loginModes
        .filter((mode) => mode.id !== currentMode)
        .map((mode) => {
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-900 shadow-sm"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{mode.label}</span>
            </button>
          );
        })}
    </div>
  </div>
);
