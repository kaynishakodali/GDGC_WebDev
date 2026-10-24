import React, { useState, useEffect } from 'react';

interface DitherImageProps {
  src: string;
  alt: string;
  aspectRatio?: number; // e.g. 1.47 or 0.68
  className?: string;
  showDitherHover?: boolean;
}

export const DitherImage: React.FC<DitherImageProps> = ({
  src,
  alt,
  aspectRatio,
  className = '',
  showDitherHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showDitherHover || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
      className={`relative overflow-hidden group select-none bg-[#273469] ${className}`}
    >
      {/* Base Full Color Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015]"
      />

      {/* Dither Monochrome Overlay (revealed on hover) */}
      {!reducedMotion && showDitherHover && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 0 : 0.88,
            backgroundImage: `radial-gradient(rgba(241, 238, 232, 0.35) 1px, transparent 1px), radial-gradient(rgba(143, 124, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '3px 3px, 6px 6px',
            backgroundColor: 'rgba(11, 10, 16, 0.45)',
            mixBlendMode: 'color'
          }}
        />
      )}

      {/* Fine dither border highlight */}
      <div className="absolute inset-0 border border-white/10 group-hover:border-[#273469]/50 transition-colors pointer-events-none" />
    </div>
  );
};
