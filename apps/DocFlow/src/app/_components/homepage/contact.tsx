import { Users, MessageCircle, Github, Zap } from 'lucide-react';

import { SITE_CONFIG } from './constants';

import { contactMethods } from '@/utils/constants/homepage';

export function Contact() {
  return (
    <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            加入{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {SITE_CONFIG.name}
            </span>{' '}
            社区
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            与全球开发者一起探索 AI 写作的无限可能
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((contact) => {
            const Icon =
              contact.type === 'wechat' ? MessageCircle : contact.type === 'github' ? Github : Zap;

            return (
              <a
                key={contact.type}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-6 bg-white border-2 border-gray-200 rounded-2xl ${contact.hoverBorder} ${contact.hoverShadow} transition-all hover:shadow-2xl hover:-translate-y-1 ${contact.delay}`}
                aria-label={contact.buttonText}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${contact.gradient} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.title}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed h-10">
                  {contact.description}
                </p>
                <span
                  className={`block w-full px-4 py-2.5 text-center bg-gradient-to-r ${contact.gradient} text-white text-sm font-medium rounded-xl shadow-lg transition-all group-hover:opacity-90 group-hover:-translate-y-0.5 group-hover:scale-105`}
                >
                  {contact.buttonText}
                </span>
              </a>
            );
          })}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-2">{SITE_CONFIG.name} Community</p>
          <p className="text-xs text-gray-500">共同构建下一代智能写作平台</p>
        </div>
      </div>
    </section>
  );
}
