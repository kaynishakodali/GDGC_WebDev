import React, { useId } from 'react';

interface LogoProps {
  variant?: 'mark' | 'full';
  size?: number;
  className?: string;
  monochrome?: boolean;
}

/** ARTOPIA's sun-arch mark pairs a hand-drawn brush arc with a gallery doorway. */
export const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 56, className = '', monochrome = false }) => {
  const gradientId = `artopia-pigment-${useId().replace(/:/g, '')}`;
  const ink = monochrome ? '#FFF5E6' : `url(#${gradientId})`;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} aria-label="ARTOPIA — Rooted in India. Made to Move You.">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0 overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4A900" />
            <stop offset=".48" stopColor="#E34234" />
            <stop offset="1" stopColor="#D81B60" />
          </linearGradient>
        </defs>
        <path d="M8 55V31C8 17.7 18.7 7 32 7s24 10.7 24 24v24" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 55V32a16 16 0 0 1 32 0v23" stroke="#087E8B" strokeWidth="1.4" strokeDasharray="2 3" />
        <path d="M20 47c7-2 12-7 17-15 3-5 6-9 11-11" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M17 55h31" stroke="#FFD65A" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="47.5" cy="19.5" r="3.2" fill="#477A45" stroke="#FFF5E6" strokeWidth="1.2" />
        <path d="m12 17 1.5 3.4 3.5 1.4-3.5 1.4L12 27l-1.4-3.8L7 21.8l3.6-1.4L12 17Z" fill="#FFD65A" />
      </svg>
      {variant === 'full' && (
        <span className="font-display text-[1.35rem] sm:text-2xl font-semibold tracking-[0.15em] text-[#FFF5E6] uppercase leading-none">
          ARTOPIA
        </span>
      )}
    </div>
  );
};
