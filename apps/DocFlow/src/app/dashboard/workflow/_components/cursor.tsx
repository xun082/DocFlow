import { motion } from 'framer-motion';
import { memo } from 'react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  name?: string;
}

const Cursor = memo(({ x, y, color, name }: CursorProps) => (
  <motion.div
    className="pointer-events-none absolute left-0 top-0 z-[5000] [backface-visibility:hidden] [perspective:1000px] [transform:translateZ(0)] [will-change:transform]"
    initial={{ x, y }}
    animate={{ x, y }}
    transition={{
      type: 'spring',
      damping: 30,
      stiffness: 800,
      mass: 0.2,
      restSpeed: 0.001,
      restDelta: 0.001,
    }}
  >
    {/* 光标图标 */}
    <svg
      width="24"
      height="24"
      viewBox="0 0 94 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
    >
      <path
        d="M2.40255 5.31234C1.90848 3.6645 3.58743 2.20312 5.15139 2.91972L90.0649 41.8264C91.7151 42.5825 91.5858 44.9688 89.8637 45.5422L54.7989 57.2186C53.3211 57.7107 52.0926 58.7582 51.3731 60.1397L33.0019 95.4124C32.1726 97.0047 29.8279 96.7826 29.3124 95.063L2.40255 5.31234Z"
        fill={color}
        stroke="white"
        strokeWidth="3"
      />
    </svg>

    {/* 用户名称标签 */}
    {name && (
      <div
        style={{ background: color }}
        className="absolute left-6 top-1 whitespace-nowrap rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      >
        {name}
      </div>
    )}
  </motion.div>
));

Cursor.displayName = 'Cursor';

export default Cursor;
