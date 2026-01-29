import { LucideIcon } from 'lucide-react';

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonGradient: string;
  borderHoverColor: string;
  shadowColor: string;
  href?: string;
  displayText?: string;
  animationDelay: string;
}

export const ContactCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonGradient,
  borderHoverColor,
  shadowColor,
  href,
  displayText,
  animationDelay,
}: ContactCardProps) => {
  const ButtonContent = () => (
    <span
      className={`w-full px-4 py-2.5 ${buttonGradient} text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg ${shadowColor} transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 flex items-center justify-center`}
    >
      {displayText || buttonText}
    </span>
  );

  return (
    <div className={`group relative ${animationDelay}`}>
      <div
        className={`relative p-6 bg-white border-2 border-gray-200 rounded-2xl ${borderHoverColor} transition-all duration-300 hover:shadow-2xl ${shadowColor} hover:-translate-y-1`}
      >
        <div className="relative z-10">
          {/* 图标 */}
          <div
            className={`flex items-center justify-center w-12 h-12 ${buttonGradient} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* 文案 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>

          {/* 按钮或链接 */}
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={buttonText}>
              <ButtonContent />
            </a>
          ) : (
            <div className="cursor-default">
              <ButtonContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
