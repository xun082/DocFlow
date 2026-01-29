import { TestimonialCard, testimonials } from './testimonial-card';

export const AuthBackground = () => (
  <section className="hidden md:block flex-1 relative p-4">
    <div
      className="absolute inset-4 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-fade-in"
      style={{
        animationDelay: '300ms',
        backgroundImage: `url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-sm" />
    </div>

    {testimonials.length > 0 && (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
        <TestimonialCard testimonial={testimonials[0]} delay="1000ms" />
        {testimonials[1] && (
          <div className="hidden xl:flex">
            <TestimonialCard testimonial={testimonials[1]} delay="1200ms" />
          </div>
        )}
      </div>
    )}
  </section>
);
