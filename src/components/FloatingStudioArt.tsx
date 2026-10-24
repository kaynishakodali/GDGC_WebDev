import React from 'react';
import { Brush, Palette, Sparkles, Paintbrush, Frame, Pencil, PaintBucket, Droplets } from 'lucide-react';

const pieces = [
  { Icon: Brush, className: 'art-drift-one left-[8%] top-[22%] rotate-[-22deg]', tone: 'text-[#42E4D0]/35', size: 48 },
  { Icon: Palette, className: 'art-drift-two right-[9%] top-[34%] rotate-[18deg]', tone: 'text-[#F48691]/35', size: 58 },
  { Icon: Brush, className: 'art-drift-three right-[22%] bottom-[16%] rotate-[58deg]', tone: 'text-[#F3C96B]/30', size: 40 },
  { Icon: Sparkles, className: 'art-drift-four left-[24%] bottom-[20%] rotate-[-12deg]', tone: 'text-[#579AFF]/40', size: 36 },
  { Icon: Paintbrush, className: 'art-drift-five left-[42%] top-[16%] rotate-[34deg]', tone: 'text-[#F3C96B]/35', size: 45 },
  { Icon: Palette, className: 'art-drift-three left-[61%] top-[52%] rotate-[-18deg]', tone: 'text-[#42E4D0]/28', size: 52 },
  { Icon: Frame, className: 'art-drift-two right-[6%] top-[10%] rotate-[10deg]', tone: 'text-[#579AFF]/32', size: 44 },
  { Icon: Pencil, className: 'art-drift-four left-[11%] top-[66%] rotate-[-38deg]', tone: 'text-[#F48691]/35', size: 38 },
  { Icon: PaintBucket, className: 'art-drift-five right-[33%] top-[73%] rotate-[12deg]', tone: 'text-[#F3C96B]/32', size: 42 },
  { Icon: Droplets, className: 'art-drift-one left-[32%] top-[45%] rotate-[22deg]', tone: 'text-[#579AFF]/35', size: 34 },
  { Icon: Frame, className: 'art-drift-five left-[55%] top-[8%] rotate-[-9deg]', tone: 'text-[#F48691]/28', size: 36 },
  { Icon: Sparkles, className: 'art-drift-two right-[16%] bottom-[10%] rotate-[14deg]', tone: 'text-[#42E4D0]/38', size: 42 },
  { Icon: Palette, className: 'art-drift-four left-[4%] bottom-[8%] rotate-[26deg]', tone: 'text-[#F48691]/30', size: 40 },
  { Icon: Paintbrush, className: 'art-drift-three right-[42%] top-[34%] rotate-[-24deg]', tone: 'text-[#F3C96B]/28', size: 36 }
];

export const FloatingStudioArt: React.FC = () => (
  <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute -left-40 top-[18%] h-80 w-80 rounded-full bg-[#347AF2]/[0.12] blur-[110px]" />
    <div className="absolute -right-32 bottom-[8%] h-96 w-96 rounded-full bg-[#68C6B7]/[0.11] blur-[120px]" />
    <div className="absolute left-[38%] top-[24%] h-72 w-72 rounded-full bg-[#F48691]/[0.075] blur-[110px]" />
    <div className="absolute right-[27%] bottom-[12%] h-64 w-64 rounded-full bg-[#F3C96B]/[0.07] blur-[100px]" />
    {pieces.map(({ Icon, className, tone, size }, index) => (
      <span key={index} className={`absolute ${tone} ${className}`} style={{ animationDelay: `${(index % 5) * -2.4}s` }}>
        <Icon size={size} strokeWidth={1.15} />
      </span>
    ))}
    <span className="art-drift-two absolute left-[70%] top-[12%] h-14 w-11 rotate-[13deg] rounded-sm border border-[#579AFF]/35 bg-gradient-to-br from-[#42E4D0]/20 via-[#579AFF]/12 to-[#F48691]/10 shadow-[0_0_38px_rgba(52,122,242,0.12)]" />
    <span className="art-drift-three absolute left-[14%] bottom-[11%] h-10 w-14 rotate-[-12deg] rounded-[45%] border border-[#F48691]/35 bg-gradient-to-r from-[#F48691]/15 to-[#F3C96B]/10" />
    <span className="art-drift-four absolute right-[15%] top-[62%] h-12 w-16 rotate-[19deg] rounded-[45%_55%_50%_40%] border border-[#42E4D0]/30 bg-gradient-to-br from-[#42E4D0]/15 to-[#347AF2]/10" />
    <span className="art-drift-five absolute left-[47%] bottom-[7%] h-12 w-10 rotate-[-16deg] rounded-t-[45%] rounded-b-lg border border-[#F3C96B]/30 bg-gradient-to-b from-[#F48691]/12 to-[#F3C96B]/15" />
  </div>
);
