import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, X, Sparkles, ShoppingCart, UserRound, ShieldCheck } from 'lucide-react';
import DitherVeil from '../../components/DitherVeil';
import { Logo } from '../../components/Logo';
import { User, Painting } from '../../api/types';
import { listPaintings } from '../../services';
import { useCart } from '../../components/CartContext';

interface LandingPageProps { user: User | null; }

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  const { itemIds } = useCart();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    listPaintings().then((rows) => active && setPaintings(rows.filter((p) => p.status === 'available').slice(0, 4))).catch(() => {});
    return () => { active = false; };
  }, []);
  return (
    <div className="artopia-home relative isolate overflow-hidden bg-transparent text-[#FFF5E6]">
      <section className="artopia-hero relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="artopia-pigment-cloud artopia-cloud-a" />
          <div className="artopia-pigment-cloud artopia-cloud-b" />
          <div className="artopia-jaali-wash" />
        </div>
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-85" aria-hidden="true">
          <div className="absolute inset-y-0 right-[-6vw] w-full lg:w-[70vw]">
            <DitherVeil src="/artopia-abstract.svg" pattern="floyd" pixelSize={2} inkColor="#28201C" paperColor="#FFF5E6" rimColor="#F4A900" rim={0.08} revealRadius={200} softness={0.6} linger={1} contrast={1.12} clickBurst={true} fit="contain" className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#28201C] via-[#28201C]/80 to-transparent lg:w-[70%]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#28201C] to-transparent" />
        </div>

        <header className="relative z-30 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-9 lg:px-14">
          <Link to="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD65A]" aria-label="ARTOPIA home">
            <Logo size={48} />
          </Link>
          <button className="artopia-icon-button md:hidden" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`${menuOpen ? 'artopia-mobile-nav' : 'hidden'} md:flex items-center gap-1 lg:gap-3`} aria-label="Main navigation">
            <a className="artopia-nav-link" href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <Link className="artopia-nav-link" to="/gallery" onClick={() => setMenuOpen(false)}>Paintings</Link>
            <Link className="artopia-nav-link" to="/wall" onClick={() => setMenuOpen(false)}>Wall Murals</Link>
            <Link className="artopia-nav-link" to="/pottery" onClick={() => setMenuOpen(false)}>Pottery</Link>
            {user && <Link className="artopia-nav-link" to={user.role === 'customer' ? '/account' : '/admin'}>{user.role === 'customer' ? 'My Activity' : 'Studio Desk'}</Link>}
            <Link className="artopia-nav-link" to="/cart" onClick={() => setMenuOpen(false)}><ShoppingCart size={15} /> Bag{itemIds.length ? ` (${itemIds.length})` : ""}</Link>{!user && <Link className="artopia-nav-cta" to="/signup">Join the studio <ArrowUpRight size={15} /></Link>}
          </nav>
        </header>

        <main id="home" className="relative z-20 mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-8 px-5 pb-20 pt-8 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.82fr)] lg:gap-5 lg:px-14 lg:pb-24 lg:pt-2">
          <div className="relative max-w-[760px] py-8 lg:py-0">
            <p className="artopia-eyebrow"><span className="artopia-eyebrow-dot" /> Independent Indian Art Studio</p>
            <h1 className="artopia-title mt-6 max-w-3xl">India, in every <span>brushstroke.</span></h1>
            <p className="mt-5 max-w-xl font-tagline text-2xl text-[#FFD65A] sm:text-3xl">Rooted in India. Made to Move You.</p>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#FFF5E6]/80 sm:text-lg sm:leading-8">Discover extraordinary Indian paintings, commission walls with a story, and bring home pottery crafted with character.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/login" className="artopia-button artopia-button-primary"><UserRound size={18} /> Login as Customer</Link>
              <Link to="/admin/login" className="artopia-button artopia-button-outline"><ShieldCheck size={18} /> Login as Admin</Link>
            </div>
            <a href="#discover" className="mt-12 inline-flex items-center gap-2 text-xs uppercase tracking-[.2em] text-[#FFF5E6]/65 transition hover:text-[#FFD65A]">Scroll to discover</a>
          </div>
          <div className="relative hidden min-h-[470px] lg:block" aria-hidden="true">
            <div className="artopia-hero-frame absolute right-[7%] top-1/2 w-[min(31vw,410px)] -translate-y-1/2 rotate-[3deg]">
              <img src="/artopia-abstract.svg" alt="Abstract pigment ribbons in peacock blue, coral, marigold, and rose" className="aspect-[4/5] w-full rounded-t-[48%] object-cover" />
              <span className="artopia-frame-caption">Abstract pigment study / 01</span>
            </div>
            <div className="artopia-seal absolute left-[2%] top-[17%]"><Sparkles size={21} /><span>Art with<br />a point of view</span></div>
            <span className="artopia-sunburst absolute bottom-[13%] left-[3%]" />
          </div>
        </main>
        <div className="relative z-20 mx-auto flex w-full max-w-[1440px] justify-between px-5 pb-6 text-[10px] uppercase tracking-[.2em] text-[#FFF5E6]/50 sm:px-9 lg:px-14">
          <span>Original works · Made slowly · Held close</span><span className="hidden sm:inline">A living gallery of Indian craft</span>
        </div>
      </section>

      <section id="discover" className="artopia-section relative z-10 mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-9 lg:px-14 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="artopia-eyebrow">Find your kind of wonder</p><h2 className="artopia-section-title mt-3">Made to live <em>with.</em></h2></div>
          <Link to="/gallery" className="artopia-text-link">View the full collection <ArrowRight size={17} /></Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Link to="/gallery" className="artopia-category artopia-category-paintings"><span className="artopia-category-kicker">01 · The collection</span><span className="artopia-category-title">Stories, painted<br />in colour.</span><span className="artopia-category-action">Explore paintings <ArrowRight size={17} /></span><span className="artopia-category-orbit" aria-hidden="true" /></Link>
          <Link to="/wall" className="artopia-category artopia-category-murals"><span className="artopia-category-kicker">02 · Made for your walls</span><span className="artopia-category-title">Give your walls<br />a story.</span><span className="artopia-category-action">Book a wall mural <ArrowRight size={17} /></span><span className="artopia-category-arch" aria-hidden="true" /></Link>
          <Link to="/pottery" className="artopia-category artopia-category-pottery"><span className="artopia-category-kicker">03 · Shaped by hand</span><span className="artopia-category-title">Crafted by hand.<br />Kept close to heart.</span><span className="artopia-category-action">Discover pottery <ArrowRight size={17} /></span><span className="artopia-category-vessel" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="artopia-featured relative z-10 px-5 py-20 sm:px-9 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="artopia-eyebrow">Selected for you</p><h2 className="artopia-section-title mt-3">A few <em>originals.</em></h2></div><Link to="/gallery" className="artopia-text-link">Explore all available works <ArrowRight size={17} /></Link></div>
          {paintings.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{paintings.map((painting, index) => <Link to={`/gallery/${painting.id}`} key={painting.id} className={`artopia-art-card artopia-card-${index + 1}`}><div className="artopia-art-image"><img src={painting.imageUrl} alt={painting.title} loading="lazy" /><span className="artopia-art-view">View artwork <ArrowUpRight size={15} /></span></div><div className="flex items-start justify-between gap-3 pt-4"><div><h3>{painting.title}</h3><p>{painting.artist}</p></div><span className="artopia-price">{money.format(painting.price)}</span></div></Link>)}</div> : <p className="mt-10 rounded-3xl border border-[#FFF5E6]/15 bg-[#28201C]/50 p-8 text-[#FFF5E6]/70">The collection is being prepared. Visit the gallery shortly to explore every original.</p>}
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#FFF5E6]/10 bg-[#28201C]/75 px-5 py-10 sm:px-9 lg:px-14">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><Logo size={40} /><p className="mt-3 text-sm text-[#FFF5E6]/65">Rooted in India. Made to Move You.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#FFF5E6]/70"><Link className="hover:text-[#FFD65A]" to="/gallery">Paintings</Link><Link className="hover:text-[#FFD65A]" to="/wall">Wall Murals</Link><Link className="hover:text-[#FFD65A]" to="/pottery">Pottery</Link>{user?.role === 'customer' ? <Link className="hover:text-[#FFD65A]" to="/account">My Activity</Link> : user ? <Link className="hover:text-[#FFD65A]" to="/admin">Studio Dashboard</Link> : <Link className="hover:text-[#FFD65A]" to="/admin/login">Studio Admin</Link>}</div></div>
      </footer>
    </div>
  );
};
