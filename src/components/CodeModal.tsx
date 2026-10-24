import React, { useState } from 'react';
import { Copy, Check, X, Sparkles, Terminal } from 'lucide-react';
import type { DitherVeilProps } from './DitherVeil';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  props: DitherVeilProps;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, props }) => {
  const [copied, setCopied] = useState(false);
  const [installCopied, setInstallCopied] = useState(false);

  if (!isOpen) return null;

  const generatedJsx = `<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DitherVeil
    src="${props.src}"
    fit="${props.fit ?? 'contain'}"
    pattern="${props.pattern ?? 'floyd'}"
    palette="${props.palette ?? 'duotone'}"
    pixelSize={${props.pixelSize ?? 2}}
    levels={${props.levels ?? 2}}
    inkColor="${props.inkColor ?? '#28201C'}"
    paperColor="${props.paperColor ?? '#FFF5E6'}"
    contrast={${props.contrast ?? 1.15}}
    brightness={${props.brightness ?? 0}}
    revealRadius={${props.revealRadius ?? 200}}
    softness={${props.softness ?? 0.6}}
    linger={${props.linger ?? 1}}
    rimColor="${props.rimColor ?? '#4F8FEA'}"
    rim={${props.rim ?? 0}}
    reverse={${props.reverse ?? false}}
    wander={${props.wander ?? false}}
    clickBurst={${props.clickBurst ?? true}}
  />
</div>`;

  const fullCode = `// 1. Install OGL:
// npm install ogl

// 2. In your React component:
import React from 'react';
import DitherVeil from './DitherVeil';

export default function HeroSection() {
  return (
    ${generatedJsx}
  );
}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(fullCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText('npm install ogl');
      setInstallCopied(true);
      setTimeout(() => setInstallCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0e0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#14141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold tracking-tight">Export React Bits Component</h3>
              <p className="text-xs text-white/50">Ready-to-use snippet with your exact active configurations</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Dependency prompt */}
          <div className="bg-[#181822] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs text-white/50 font-mono">Dependency Required</div>
                <code className="text-sm font-mono text-white font-medium">npm install ogl</code>
              </div>
            </div>
            <button
              onClick={copyInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white transition-all"
            >
              {installCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{installCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code block */}
          <div className="relative rounded-xl border border-white/10 bg-[#070709] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#121218]">
              <span className="text-xs font-mono text-white/40">JSX Usage</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Full Snippet'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-indigo-200/90 leading-relaxed max-h-[380px]">
              {fullCode}
            </pre>
          </div>

          {/* Quick Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/60">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="font-semibold text-white/90 block mb-1">CORS Notice:</span>
              Images must be served with accessible <code className="text-indigo-300">Access-Control-Allow-Origin</code> headers for WebGL texture sampler reading.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="font-semibold text-white/90 block mb-1">WebGL 2 Support:</span>
              DitherVeil automatically leverages WebGL2 half-float render textures for silky smooth mask accumulation and shockwaves.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
