import React, { useState } from 'react';
import { Painting, PotteryItem, Glaze, User } from '../../api/types';
import { DitherImage } from '../../components/DitherImage';
import { formatINR } from '../../demo-data/store';
import { Pottery3DCanvas, GLAZE_COLORS } from '../../components/Pottery3DCanvas';
import { ItemDetailModal } from '../../components/ItemDetailModal';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Layers,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface BrowseViewProps {
  paintings: Painting[];
  potteryItems: PotteryItem[];
  glazes: Glaze[];
  muralRate: number;
  user: User | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectPainting: (p: Painting) => void;
  onSelectPottery: (pot: PotteryItem) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  paintings,
  potteryItems,
  glazes,
  muralRate,
  user,
  loading,
  onRefresh,
  onSelectPainting,
  onSelectPottery
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [activeGlazeId, setActiveGlazeId] = useState<string>('g-01');

  const filteredPaintings = paintings
    .filter((p) => {
      if (filter === 'available') return p.status === 'available';
      if (filter === 'sold') return p.status === 'sold';
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="space-y-16 pb-24">
      {/* ── Subheader & Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[11px] font-mono-hud text-[#F4A900] uppercase tracking-widest block mb-1">
            Curated Atelier Collection
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-light text-[#FFF5E6] tracking-wide">
            Masterworks on Canvas
          </h2>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-full bg-[#273469] border border-white/10">
            {(['all', 'available', 'sold'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                  filter === mode
                    ? 'bg-[#F4A900] text-[#28201C] font-bold shadow-sm'
                    : 'text-[#E3D0BE] hover:text-white'
                }`}
              >
                {mode === 'all' ? `All (${paintings.length})` : mode}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#273469] border border-white/10 text-xs text-[#E3D0BE]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#F4A900]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent text-[#FFF5E6] outline-none cursor-pointer text-xs"
            >
              <option value="default" className="bg-[#28201C]">Curator Order</option>
              <option value="price-asc" className="bg-[#28201C]">Price: Low to High</option>
              <option value="price-desc" className="bg-[#28201C]">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-[24px] bg-[#273469]/40 border border-white/5 animate-pulse flex flex-col justify-end p-6 space-y-3"
            >
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty Filter State ── */}
      {!loading && filteredPaintings.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <p className="font-display text-2xl text-white">No artworks match this criterion</p>
          <p className="text-xs text-[#E3D0BE]">Try adjusting your status filter above.</p>
          <button
            onClick={() => setFilter('all')}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white"
          >
            Show All Artworks
          </button>
        </div>
      )}

      {/* ── Asymmetrical Editorial Paintings Grid (True Aspect Ratios) ── */}
      {!loading && filteredPaintings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredPaintings.map((painting) => {
            const isSold = painting.status === 'sold';

            return (
              <div
                key={painting.id}
                onClick={() => onSelectPainting(painting)}
                className="group relative rounded-[26px] bg-[#273469]/60 backdrop-blur-md border border-white/10 hover:border-[#F4A900]/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-xl flex flex-col hover:-translate-y-1.5"
              >
                {/* Image Container with Dither Reveal on Hover */}
                <div
                  className="relative w-full h-[300px] sm:h-[340px] overflow-hidden bg-[#28201C] flex items-center justify-center p-4"
                >
                  <DitherImage
                    src={painting.imageUrl}
                    alt={painting.title}
                    aspectRatio={4 / 3}
                    className="w-full h-full rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-5 left-5 z-20">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono-hud font-bold tracking-wider uppercase backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                        isSold
                          ? 'bg-[#FF5C5C]/20 border-[#FF5C5C]/40 text-[#FF5C5C]'
                          : 'bg-[#FFD65A]/20 border-[#FFD65A]/40 text-[#FFD65A]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-[#FF5C5C]' : 'bg-[#FFD65A]'}`} />
                      {isSold ? 'SOLD' : painting.saleMode === 'auction' ? (painting.auctionOpen ? 'BIDDING OPEN' : 'AUCTION CLOSED') : 'AVAILABLE'}
                    </span>
                  </div>
                </div>

                {/* Card Metadata */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display font-light text-xl text-[#FFF5E6] group-hover:text-white transition-colors line-clamp-2">
                      {painting.title}
                    </h3>
                    <p className="text-xs text-[#E3D0BE] font-sans-ui">
                      By <span className="text-[#087E8B] font-tagline text-sm italic">{painting.artist}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono-hud font-bold text-base text-[#087E8B]">
                      {painting.saleMode === 'auction'
                        ? `${painting.currentBid == null ? 'Opening' : 'Current'} bid ${formatINR(painting.currentBid ?? painting.price)}`
                        : formatINR(painting.price)}
                    </span>
                    <span className="text-[11px] font-sans-ui font-medium text-[#F4A900] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Inspect Artwork</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pottery Atelier Strip (Carved Procedural Objects) ── */}
      <section className="pt-10 border-t border-white/10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono-hud text-[#F4A900] uppercase tracking-widest block mb-1">
              Wheel-Thrown Studio Terracotta
            </span>
            <h3 className="text-3xl font-display font-light text-[#FFF5E6] tracking-wide">
              Pottery Atelier & Custom Glazes
            </h3>
            <p className="text-xs text-[#E3D0BE] max-w-xl mt-1.5">
              Each vessel is individually carved with traditional geometry and finished with earth glazes. Made on request with a 14-day curing cycle.
            </p>
          </div>

          <Link
            to="/pottery"
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#FFF5E6] font-medium transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#F4A900]" />
            <span>Open Customizer</span>
          </Link>
        </div>

        {/* 5 Pottery Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {potteryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPottery(item)}
              className="group rounded-[22px] bg-[#273469]/60 backdrop-blur-md border border-white/10 hover:border-[#F4A900]/50 p-4 transition-all duration-300 text-center space-y-3 cursor-pointer hover:-translate-y-1"
            >
              <div className="w-full h-44 bg-[#28201C] rounded-xl flex items-center justify-center overflow-hidden">
                <Pottery3DCanvas
                  itemId={item.id}
                  glazeId={activeGlazeId}
                  size={170}
                  interactive={false}
                />
              </div>
              <div>
                <h4 className="font-display font-light text-sm text-white group-hover:text-[#F4A900] transition-colors truncate">
                  {item.name}
                </h4>
                <span className="text-[10px] text-[#E3D0BE] block mt-0.5">
                  Handmade to order
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mural Banner ── */}
      <section className="rounded-[28px] bg-gradient-to-r from-[#087E8B] via-[#273469] to-[#28201C] border border-white/15 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl relative z-10">
          <span className="text-[10px] font-mono-hud text-[#F4A900] uppercase tracking-widest">
            Site-Specific Architectural Commission
          </span>
          <h3 className="text-3xl sm:text-4xl font-display font-light text-white tracking-wide">
            Transform Your Living Space with a Wall Mural
          </h3>
          <p className="text-xs sm:text-sm text-[#E3D0BE] leading-relaxed">
            Invite the studio artists to execute custom site-specific murals directly onto your interior wall. Standard rate: {formatINR(muralRate)} / sq ft.
          </p>
        </div>

        <Link
          to="/wall"
          className="relative z-10 px-8 py-4 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#F4A900]/20 flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span>Schedule Wall Visit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
