"use client"

import { useEffect, useRef } from "react"

const STARS = [
  { x: 8,  y: 12, size: 3, delay: 0,    dur: 3.2 },
  { x: 15, y: 68, size: 2, delay: 0.8,  dur: 4.1 },
  { x: 22, y: 35, size: 4, delay: 1.5,  dur: 2.8 },
  { x: 30, y: 82, size: 2, delay: 0.3,  dur: 3.7 },
  { x: 38, y: 18, size: 3, delay: 2.1,  dur: 4.5 },
  { x: 45, y: 55, size: 2, delay: 0.6,  dur: 3.0 },
  { x: 52, y: 90, size: 4, delay: 1.9,  dur: 2.5 },
  { x: 60, y: 28, size: 2, delay: 1.1,  dur: 4.8 },
  { x: 68, y: 72, size: 3, delay: 0.4,  dur: 3.4 },
  { x: 75, y: 42, size: 2, delay: 2.5,  dur: 3.9 },
  { x: 82, y: 88, size: 4, delay: 0.9,  dur: 2.7 },
  { x: 90, y: 15, size: 2, delay: 1.7,  dur: 4.2 },
  { x: 95, y: 60, size: 3, delay: 0.2,  dur: 3.6 },
  { x: 5,  y: 48, size: 2, delay: 2.8,  dur: 4.0 },
  { x: 72, y: 5,  size: 3, delay: 1.3,  dur: 3.3 },
  { x: 48, y: 75, size: 2, delay: 3.1,  dur: 2.9 },
  { x: 85, y: 33, size: 4, delay: 0.7,  dur: 4.4 },
  { x: 18, y: 95, size: 2, delay: 2.0,  dur: 3.1 },
  { x: 35, y: 52, size: 3, delay: 1.4,  dur: 4.7 },
  { x: 63, y: 8,  size: 2, delay: 0.5,  dur: 3.8 },
]

function StarSvg({ size }: Readonly<{ size: number }>) {
  const s = size
  return (
    <svg width={s * 4} height={s * 4} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z"
        fill="#C9A84C"
      />
    </svg>
  )
}

export function AdminStars() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = "1"
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-1000"
    >
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left:      `${star.x}%`,
            top:       `${star.y}%`,
            animation: `starPulse ${star.dur}s ease-in-out ${star.delay}s infinite`,
          }}
        >
          <StarSvg size={star.size} />
        </div>
      ))}

      <style>{`
        @keyframes starPulse {
          0%, 100% { opacity: 0.08; transform: scale(0.8) rotate(0deg); }
          50%       { opacity: 0.55; transform: scale(1.2) rotate(20deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="starPulse"] { animation: none !important; opacity: 0.15 !important; }
        }
      `}</style>
    </div>
  )
}
