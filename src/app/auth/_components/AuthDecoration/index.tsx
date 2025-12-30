export default function AuthDecoration() {
  return (
    <div className="hidden lg:block w-[500px] h-[500px] relative">
      {/* Gradient circles */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-gray-500/5 to-black/10 blur-3xl animate-pulse" />

      {/* Concentric circles */}
      <div className="absolute inset-0 rounded-full border border-white/30" />
      <div className="absolute inset-8 rounded-full border border-white/25" />
      <div className="absolute inset-16 rounded-full border border-white/20" />
      <div className="absolute inset-24 rounded-full border border-white/15" />

      {/* Rotating arcs */}
      <div className="absolute inset-0 rounded-full border-4 border-t-white/30 border-r-gray-400/30 border-b-gray-500/30 border-l-transparent animate-[spin_20s_linear_infinite]" />
      <div className="absolute inset-8 rounded-full border-4 border-t-gray-500/30 border-r-white/30 border-b-gray-400/30 border-l-transparent animate-[spin_15s_linear_infinite_reverse]" />

      {/* Floating dots */}
      <div
        className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-white/40 blur-sm animate-pulse"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-gray-400/40 blur-sm animate-pulse"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-4 h-4 rounded-full bg-gray-500/40 blur-sm animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-4 h-4 rounded-full bg-gray-600/40 blur-sm animate-pulse"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Hexagon */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/30 rotate-30"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />

      {/* Cross gradient lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-56 bg-gradient-to-b from-transparent via-gray-400/30 to-transparent" />

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-gray-400/40 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-gray-500/40 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-gray-600/40 rounded-br-lg" />

      {/* Position dots */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute top-1/2 left-1/6 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute top-1/2 right-1/6 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50" />

      {/* Additional floating elements */}
      <div className="absolute top-1/3 left-1/3 w-10 h-10 rounded-full border-2 border-white/30 rotate-12" />
      <div className="absolute bottom-1/3 right-1/3 w-10 h-10 rounded-full border-2 border-gray-400/30 -rotate-12" />
      <div className="absolute top-2/3 left-1/4 w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-gray-500/20" />
      <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-gradient-to-br from-gray-400/20 to-gray-600/20" />
    </div>
  );
}
