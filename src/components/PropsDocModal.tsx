import React from 'react';
import { X, BookOpen, Layers, Cpu, Eye, Palette } from 'lucide-react';

interface PropsDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropsDocModal: React.FC<PropsDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const propsList = [
    { name: 'src', type: 'string', def: 'DEFAULT_SRC', desc: 'Source URL of image to veil. Must be served with CORS headers.' },
    { name: 'fit', type: "'contain' | 'cover'", def: "'contain'", desc: 'Show the whole image on the ink or crop it to fill container dimensions.' },
    { name: 'pattern', type: "'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines'", def: "'floyd'", desc: 'How image is broken into dots: 8x8 Bayer grid, blue noise stipple, Atkinson or Floyd-Steinberg error diffusion, or diagonal engraving lines.' },
    { name: 'palette', type: "'duotone' | 'rgb'", def: "'duotone'", desc: 'Duotone maps brightness between ink and paper colors. RGB dithers each color channel independently.' },
    { name: 'pixelSize', type: 'number', def: '2', desc: 'Size of each dither cell in pixels. 1px is ultra-fine grain; 4px+ is chunky pixel-art.' },
    { name: 'levels', type: 'number', def: '2', desc: 'Tones per channel. 2 is pure 1-bit high-contrast; higher values add intermediate steps.' },
    { name: 'inkColor', type: 'string', def: "'#28201C'", desc: 'Color of the darkest shade/shadow tone.' },
    { name: 'paperColor', type: 'string', def: "'#FFF5E6'", desc: 'Color of the brightest highlight tone.' },
    { name: 'contrast', type: 'number', def: '1.15', desc: 'Tonal contrast applied prior to dithering.' },
    { name: 'brightness', type: 'number', def: '0', desc: 'Shifts image lighter or darker before dithering step.' },
    { name: 'revealRadius', type: 'number', def: '200', desc: 'Radius in pixels of full-color unveiling circle around cursor.' },
    { name: 'softness', type: 'number', def: '0.6', desc: 'How much the reveal boundary dissolves into dither. 0 is a sharp cut, 1 is a gradual dissolve.' },
    { name: 'linger', type: 'number', def: '1', desc: 'Seconds the revealed cursor trail takes to knit back into dither. 0 disables trail.' },
    { name: 'rimColor', type: 'string', def: "'#4F8FEA'", desc: 'Accent tint along the dissolving threshold edge.' },
    { name: 'rim', type: 'number', def: '0', desc: 'Thickness of colored rim on dissolving boundary. 0 hides it.' },
    { name: 'reverse', type: 'boolean', def: 'false', desc: 'Start in full color and dither wherever cursor sweeps.' },
    { name: 'wander', type: 'boolean', def: 'false', desc: 'Lets reveal center drift around automatically when pointer is inactive.' },
    { name: 'clickBurst', type: 'boolean', def: 'true', desc: 'Clicking triggers expanding shockwave ripples across image.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0e0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#14141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold tracking-tight">DitherVeil API Reference</h3>
              <p className="text-xs text-white/50">Full specification, mathematical algorithms & prop table from React Bits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-white/80">
          {/* Algorithm Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                Error Diffusion
              </div>
              <h4 className="text-white font-medium text-sm">Floyd & Atkinson</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Propagates quantization error to neighbor pixels in a serpentine scanline pass (Atkinson 1/8 taps, Floyd-Steinberg 7/16, 3/16, 5/16, 1/16).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                Ordered & Blue Noise
              </div>
              <h4 className="text-white font-medium text-sm">Bayer & Stipple</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Computed via bitwise 8x8 index matrices or procedural 64x64 blue noise energy field splats for organic grain distribution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                Dual-Buffer Masking
              </div>
              <h4 className="text-white font-medium text-sm">Shockwaves & Trails</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Ping-pongs WebGL2 float render targets (`RGBA16F`) with stroke distance calculation and trigonometric shockwave expansion.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#07070a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Prop</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {propsList.map((p) => (
                    <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 text-indigo-300 font-semibold">{p.name}</td>
                      <td className="py-2.5 px-4 text-white/60">{p.type}</td>
                      <td className="py-2.5 px-4 text-amber-300/80">{p.def}</td>
                      <td className="py-2.5 px-4 font-sans text-white/70">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
