import React from 'react';
import { Brush, Palette, Sparkles, Paintbrush, Frame, Pencil, PaintBucket, Droplets } from 'lucide-react';

const pieces = [
  { Icon: Brush, className: 'art-drift-one left-[8%] top-[22%] rotate-[-22deg]', tone: 'text-[#F4A900]/35', size: 48 },
  { Icon: Palette, className: 'art-drift-two right-[9%] top-[34%] rotate-[18deg]', tone: 'text-[#E34234]/35', size: 58 },
  { Icon: Brush, className: 'art-drift-three right-[22%] bottom-[16%] rotate-[58deg]', tone: 'text-[#FFD65A]/30', size: 40 },
  { Icon: Sparkles, className: 'art-drift-four left-[24%] bottom-[20%] rotate-[-12deg]', tone: 'text-[#087E8B]/40', size: 36 },
  { Icon: Paintbrush, className: 'art-drift-five left-[42%] top-[16%] rotate-[34deg]', tone: 'text-[#FFD65A]/35', size: 45 },
  { Icon: Palette, className: 'art-drift-three left-[61%] top-[52%] rotate-[-18deg]', tone: 'text-[#F4A900]/28', size: 52 },
  { Icon: Frame, className: 'art-drift-two right-[6%] top-[10%] rotate-[10deg]', tone: 'text-[#087E8B]/32', size: 44 },
  { Icon: Pencil, className: 'art-drift-four left-[11%] top-[66%] rotate-[-38deg]', tone: 'text-[#E34234]/35', size: 38 },
  { Icon: PaintBucket, className: 'art-drift-five right-[33%] top-[73%] rotate-[12deg]', tone: 'text-[#FFD65A]/32', size: 42 },
  { Icon: Droplets, className: 'art-drift-one left-[32%] top-[45%] rotate-[22deg]', tone: 'text-[#087E8B]/35', size: 34 },
  { Icon: Frame, className: 'art-drift-five left-[55%] top-[8%] rotate-[-9deg]', tone: 'text-[#E34234]/28', size: 36 },
  { Icon: Sparkles, className: 'art-drift-two right-[16%] bottom-[10%] rotate-[14deg]', tone: 'text-[#F4A900]/38', size: 42 },
  { Icon: Palette, className: 'art-drift-four left-[4%] bottom-[8%] rotate-[26deg]', tone: 'text-[#E34234]/30', size: 40 },
  { Icon: Paintbrush, className: 'art-drift-three right-[42%] top-[34%] rotate-[-24deg]', tone: 'text-[#FFD65A]/28', size: 36 }
];

export const FloatingStudioArt: React.FC<{ className?: string }> = ({ className = 'z-0' }) => (
  <div aria-hidden="true" className={`fixed inset-0 ${className} overflow-hidden pointer-events-none select-none`}>
    <div className="absolute -left-40 top-[18%] h-80 w-80 rounded-full bg-[#273469]/[0.12] blur-[110px]" />
    <div className="absolute -right-32 bottom-[8%] h-96 w-96 rounded-full bg-[#477A45]/[0.11] blur-[120px]" />
    <div className="absolute left-[38%] top-[24%] h-72 w-72 rounded-full bg-[#E34234]/[0.075] blur-[110px]" />
    <div className="absolute right-[27%] bottom-[12%] h-64 w-64 rounded-full bg-[#FFD65A]/[0.07] blur-[100px]" />
    {pieces.map(({ Icon, className, tone, size }, index) => (
      <span key={index} className={`absolute ${tone} ${className}`} style={{ animationDelay: `${(index % 5) * -2.4}s` }}>
        <Icon size={size} strokeWidth={1.15} />
      </span>
    ))}
    <span className="art-drift-two absolute left-[70%] top-[12%] h-14 w-11 rotate-[13deg] rounded-sm border border-[#087E8B]/35 bg-gradient-to-br from-[#F4A900]/20 via-[#087E8B]/12 to-[#E34234]/10 shadow-[0_0_38px_rgba(52,122,242,0.12)]" />
    <span className="art-drift-three absolute left-[14%] bottom-[11%] h-10 w-14 rotate-[-12deg] rounded-[45%] border border-[#E34234]/35 bg-gradient-to-r from-[#E34234]/15 to-[#FFD65A]/10" />
    <span className="art-drift-four absolute right-[15%] top-[62%] h-12 w-16 rotate-[19deg] rounded-[45%_55%_50%_40%] border border-[#F4A900]/30 bg-gradient-to-br from-[#F4A900]/15 to-[#273469]/10" />
    <span className="art-drift-five absolute left-[47%] bottom-[7%] h-12 w-10 rotate-[-16deg] rounded-t-[45%] rounded-b-lg border border-[#FFD65A]/30 bg-gradient-to-b from-[#E34234]/12 to-[#FFD65A]/15" />
  </div>
);
