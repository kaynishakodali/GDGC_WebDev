import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DitherVeil from '../../components/DitherVeil';
import { Logo } from '../../components/Logo';
import { HeroButton } from '../../components/HeroButton';
import { User } from '../../api/types';
import { Maximize2, Minimize2 } from 'lucide-react';

interface LandingPageProps { user: User | null; }

export const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = (path: string) => {
    setIsTransitioning(true);
    window.setTimeout(() => navigate(path), 240);
  };
  const handleCustomerClick = () => goTo(user && user.role === 'customer' ? '/gallery' : '/login');
  const handleAdminClick = () => goTo(user && ['admin', 'studio'].includes(user.role) ? '/admin' : '/admin/login');
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
      setIsFullscreen(Boolean(document.fullscreenElement));
    } catch { setIsFullscreen(Boolean(document.fullscreenElement)); }
  };

  return (
    <div className={`relative min-h-[100dvh] overflow-hidden bg-transparent text-[#F6F3E9] transition-opacity duration-300 ${isTransitioning ? 'opacity-0 scale-[0.99] pointer-events-none' : 'opacity-100'}`}>
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-24 top-[18%] h-[45vw] w-[45vw] rounded-full bg-[#103B46]/55 blur-[130px] animate-aurora-1" />
        <div className="absolute bottom-[-10%] left-[34%] h-[38vw] w-[38vw] rounded-full bg-[#0B2633]/70 blur-[120px] animate-aurora-2" />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-auto">
        <div className="h-full w-full lg:translate-x-[14vw]">
          <DitherVeil src="/images/chrome-head.jpg" pattern="floyd" pixelSize={2} inkColor="#09131E" paperColor="#F2EAD7" rimColor="#42E4D0" rim={0.1} revealRadius={200} softness={0.6} linger={1} contrast={1.15} clickBurst={true} fit="contain" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#06111D] via-[#06111D]/85 to-transparent lg:w-[62vw]" />
      </div>
      <header className="absolute left-6 top-6 z-30 sm:left-8 sm:top-8">
        <Logo variant="full" size={56} />
      </header>
      <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className="absolute right-6 top-6 z-30 rounded-full border border-white/15 bg-[#06111D]/55 p-2.5 text-[#B7D6D3] backdrop-blur-md transition hover:border-[#42E4D0]/60 hover:text-white sm:right-8 sm:top-8">
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <main className="relative z-20 flex min-h-[100dvh] w-full max-w-3xl flex-col justify-center px-7 pb-16 pt-28 sm:px-10 lg:max-w-[58vw] lg:px-[6vw]">
        <div className="space-y-5 sm:space-y-6">
          <p className="font-mono-hud text-[11px] uppercase tracking-[0.24em] text-[#42E4D0] sm:text-xs">AN INDEPENDENT ART STUDIO</p>
          <h1 className="max-w-3xl font-hero-display text-6xl leading-[0.88] text-transparent bg-clip-text bg-gradient-to-r from-[#42E4D0] via-[#579AFF] to-[#F48691] sm:text-8xl lg:text-[clamp(6rem,8vw,8.5rem)]">
            Art beyond the obvious.
          </h1>
          <p className="font-tagline text-2xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#579AFF] to-[#F48691] sm:text-4xl">
            “There’s more that meets the eye.”
          </p>
          <p className="max-w-lg text-sm leading-relaxed text-[#D0D5E7] sm:text-base">
            Original paintings, expressive walls, and handcrafted objects. Find something that speaks to you.
          </p>
          <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <HeroButton label="Login as Customer" icon="arrow" accentColor="lilac" onClick={handleCustomerClick} />
            <HeroButton label="Login as Admin" icon="lock" accentColor="peach" onClick={handleAdminClick} />
          </div>
        </div>
      </main>
      <p className="absolute bottom-6 left-7 z-20 hidden font-mono-hud text-[10px] uppercase tracking-[0.18em] text-[#B7D6D3]/70 md:block sm:left-10 lg:left-[6vw]">Original works · Made slowly · Held close</p>
    </div>
  );
};
