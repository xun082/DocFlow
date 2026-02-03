import { FEATURES } from './constants';
import { FeatureCard } from './feature-card';

export function Features() {
  return (
    <section id="features" className="relative py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            DocFlow
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}
              核心能力矩阵
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            九大核心功能模块,构建完整的 AI 驱动内容创作生态系统
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
