export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay: string;
}

export const TestimonialCard = ({ testimonial, delay }: TestimonialCardProps) => (
  <div
    className="flex items-start gap-3 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-5 w-64 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="font-medium text-white">{testimonial.name}</p>
      <p className="text-white/60">{testimonial.handle}</p>
      <p className="mt-1 text-white/80">{testimonial.text}</p>
    </div>
  </div>
);

export const testimonials: Testimonial[] = [
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    name: '张小雨',
    handle: '@zhangxiaoyu',
    text: '非常棒的平台！用户体验流畅，功能恰到好处，完全满足我的需求。',
  },
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    name: '李明',
    handle: '@liming',
    text: '这个服务彻底改变了我的工作方式。设计简洁，功能强大，支持也很到位。',
  },
];
