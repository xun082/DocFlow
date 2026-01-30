import type { FeatureItem } from './types';

interface FeatureCardProps {
  feature: FeatureItem;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <article className="group relative">
      <div
        className={`relative ${feature.bgColor} rounded-2xl border-2 ${feature.borderColor} ${feature.hoverBorder} overflow-hidden p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div
              className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
          <h3
            className={`text-xl font-bold ${feature.textColor} mb-3 text-center transition-all duration-300`}
          >
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
            {feature.description}
          </p>
        </div>
      </div>
    </article>
  );
}
