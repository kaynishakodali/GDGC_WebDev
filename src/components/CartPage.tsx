import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShoppingBag, Trash2 } from 'lucide-react';
import { Painting, User } from '../api/types';
import { BrandBar } from './BrandBar';
import { CheckoutDialog } from './CheckoutDialog';
import { useCart } from './CartContext';
import { listPaintings } from '../services';
import { formatINR } from '../demo-data/store';

export function CartPage({ user }: { user: User | null }) {
  const { itemIds, removeItem } = useCart();
  const navigate = useNavigate();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listPaintings().then((items) => active && setPaintings(items)).catch(() => {}).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const bag = useMemo(() => itemIds.map((id) => paintings.find((p) => p.id === id)).filter((p): p is Painting => Boolean(p)), [itemIds, paintings]);
  const unavailable = itemIds.filter((id) => paintings.some((p) => p.id === id && (p.status !== 'available' || p.saleMode === 'auction')));
  useEffect(() => { unavailable.forEach(removeItem); }, [unavailable.join('|'), removeItem]);
  const total = bag.reduce((sum, p) => sum + p.price, 0);

  return <div className="min-h-screen text-[#FFF5E6]"><BrandBar user={user} /><main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
    <p className="artopia-eyebrow">Your studio bag</p><h1 className="mt-3 font-display text-5xl sm:text-6xl">Originals you love.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#E3D0BE]">Each painting is one of a kind. Checkout reserves one original at a time, with availability rechecked securely by the studio.</p>
    {loading ? <div className="mt-10 rounded-3xl border border-white/10 bg-[#273469]/50 p-8">Loading your bag…</div> : !bag.length ? <div className="mt-10 rounded-3xl border border-white/10 bg-[#273469]/50 p-10 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-[#FFD65A]"/><h2 className="mt-4 font-display text-3xl">Your bag is waiting for a story.</h2><p className="mt-2 text-sm text-[#E3D0BE]">Browse the original paintings and add a piece to your bag.</p><Link className="artopia-button artopia-button-primary mt-6" to="/gallery">Explore paintings <ArrowRight size={17}/></Link></div> : <>
      <div className="mt-8 grid gap-4">{bag.map((painting) => <article key={painting.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#273469]/55 p-4 sm:flex-row sm:items-center"><img className="h-32 w-full rounded-2xl object-cover sm:w-28" src={painting.imageUrl} alt={painting.title}/><div className="min-w-0 flex-1"><h2 className="font-display text-2xl">{painting.title}</h2><p className="mt-1 text-xs text-[#E3D0BE]">{painting.artist} · One original</p><p className="mt-2 font-mono-hud text-sm font-bold text-[#FFD65A]">{formatINR(painting.price)}</p></div><div className="flex items-center gap-2"><button onClick={() => removeItem(painting.id)} className="artopia-icon-button" aria-label={`Remove ${painting.title} from bag`}><Trash2 size={17}/></button><button disabled={Boolean(user && user.role !== 'customer')} onClick={() => user?.role === 'customer' ? setSelected(painting) : navigate('/login', { state:{ from:{ pathname:'/cart' } } })} className="artopia-button artopia-button-primary disabled:cursor-not-allowed disabled:opacity-50">{user && user.role !== 'customer' ? 'Studio view only' : 'Checkout this original'} <ArrowRight size={16}/></button></div></article>)}</div>
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#FFD65A]/30 bg-[#273469]/65 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-widest text-[#E3D0BE]">Bag total · {bag.length} {bag.length === 1 ? 'original' : 'originals'}</p><p className="mt-1 font-mono-hud text-2xl font-bold text-[#FFD65A]">{formatINR(total)}</p></div><p className="max-w-md text-xs leading-5 text-[#E3D0BE]">Each unique work creates its own order record. Checkout items individually to keep availability and auction rules accurate.</p></div>
      {user?.role && user.role !== 'customer' && <p className="mt-4 text-sm text-[#FFD65A]">Studio accounts can manage inventory but cannot make customer purchases.</p>}
    </>}
  </main>{selected && <CheckoutDialog painting={selected} isOpen onClose={() => setSelected(null)} onSuccess={() => { removeItem(selected.id); setSelected(null); listPaintings().then(setPaintings).catch(() => {}); }} />}</div>;
}
