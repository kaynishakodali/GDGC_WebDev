import React, { useId } from 'react';

interface LogoProps {
  variant?: 'mark' | 'full';
  size?: number;
  className?: string;
  monochrome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 56, className = '' }) => {
  const gradientId = `obsura-orbit-${useId().replace(/:/g, '')}`;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} aria-label="OBSURA independent art studio">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id={gradientId} x1="9" y1="14" x2="57" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#42E4D0" />
            <stop offset="0.48" stopColor="#347AF2" />
            <stop offset="0.78" stopColor="#F48691" />
            <stop offset="1" stopColor="#F3C96B" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#06111D" stroke={`url(#${gradientId})`} strokeOpacity=".8" strokeWidth="1.5" />
        <ellipse cx="32" cy="32" rx="24" ry="10.5" transform="rotate(-32 32 32)" stroke={`url(#${gradientId})`} strokeWidth="2.2" />
        <path d="M39.7 13.6c-10.3 1.1-17.8 8.5-17.8 18.7 0 10.7 7.6 18.1 18.6 18.1-3.4 2.1-7.4 3.3-11.8 3.3-12.2 0-21.1-8.7-21.1-20.4 0-12.3 9.2-21.1 21.8-21.1 3.7 0 7.2.5 10.3 1.4Z" fill={`url(#${gradientId})`} />
        <circle cx="49.5" cy="17" r="2.7" fill="#F3C96B" />
        <path d="m16 14 1.3 3.8 3.7 1.2-3.7 1.3-1.3 3.7-1.2-3.7-3.8-1.3 3.8-1.2L16 14Z" fill="#F6F3E9" fillOpacity=".9" />
      </svg>
      {variant === 'full' && (
        <span className="font-display text-2xl sm:text-3xl font-light tracking-[0.24em] text-[#F6F3E9] uppercase leading-none">
          OBSURA
        </span>
      )}
    </div>
  );
};
