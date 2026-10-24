import React, { useState, useEffect } from 'react';
import { Painting, PotteryItem, Glaze, User } from '../api/types';
import { formatINR } from '../demo-data/store';
import { Pottery3DCanvas, GLAZE_COLORS } from './Pottery3DCanvas';
import { CheckoutDialog } from './CheckoutDialog';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'painting' | 'pottery';
  painting?: Painting | null;
  pottery?: PotteryItem | null;
  glazes?: Glaze[];
  allPaintings?: Painting[];
  allPottery?: PotteryItem[];
  onSelectPainting?: (p: Painting) => void;
  onSelectPottery?: (pot: PotteryItem) => void;
  user: User | null;
  onPaintingBought?: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  painting,
  pottery,
  glazes = [],
  allPaintings = [],
  allPottery = [],
  onSelectPainting,
  onSelectPottery,
  user,
  onPaintingBought
}) => {
  const navigate = useNavigate();
  const [selectedGlazeId, setSelectedGlazeId] = useState<string>('g-01');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, painting, pottery, type]);

  if (!isOpen) return null;

  const isPainting = type === 'painting' && painting;
  const isPottery = type === 'pottery' && pottery;

  const handlePrev = () => {
    if (isPainting && onSelectPainting && allPaintings.length > 0) {
      const idx = allPaintings.findIndex((p) => p.id === painting.id);
      const prevIdx = (idx - 1 + allPaintings.length) % allPaintings.length;
      onSelectPainting(allPaintings[prevIdx]);
    } else if (isPottery && onSelectPottery && allPottery.length > 0) {
      const idx = allPottery.findIndex((p) => p.id === pottery.id);
      const prevIdx = (idx - 1 + allPottery.length) % allPottery.length;
      onSelectPottery(allPottery[prevIdx]);
    }
  };

  const handleNext = () => {
    if (isPainting && onSelectPainting && allPaintings.length > 0) {
      const idx = allPaintings.findIndex((p) => p.id === painting.id);
      const nextIdx = (idx + 1) % allPaintings.length;
      onSelectPainting(allPaintings[nextIdx]);
    } else if (isPottery && onSelectPottery && allPottery.length > 0) {
      const idx = allPottery.findIndex((p) => p.id === pottery.id);
      const nextIdx = (idx + 1) % allPottery.length;
      onSelectPottery(allPottery[nextIdx]);
    }
  };

  const handleRequestPottery = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/pottery?item=${pottery?.id}&glaze=${selectedGlazeId}`);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-artwork-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-xl animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-[1180px] h-full max-h-[88vh] rounded-[28px] bg-[#0B2633] border border-white/15 shadow-2xl flex flex-col md:flex-row overflow-hidden text-[#F6F3E9]">
          {/* Top Iridescent Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#42E4D0] via-[#579AFF] to-[#68C6B7] z-20" />

          {/* Close Button Top-Right */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev/Next Navigation Arrows (Desktop overlay) */}
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Previous Artwork"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 md:right-16 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer shadow-lg"
            title="Next Artwork"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* ── LEFT HALF: IMAGE OR 3D CANVAS (Full Height, Contain) ── */}
          <div className="w-full md:w-1/2 h-72 md:h-full relative overflow-hidden bg-[#06111D] flex items-center justify-center p-4 sm:p-8">
            {isPainting && (
              <>
                {/* Enlarged blurred ambient backdrop */}
                <img
                  src={painting.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125 pointer-events-none"
                />

                {/* Main Artwork: 100% true proportions without cropping */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img
                    src={painting.imageUrl}
                    alt={painting.title}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                  />
                  {painting.status === 'sold' && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FF5C5C]/90 text-white font-mono-hud text-[11px] font-bold uppercase shadow-lg">
                      SOLD
                    </div>
                  )}
                </div>
              </>
            )}

            {isPottery && (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <Pottery3DCanvas
                  itemId={pottery.id}
                  glazeId={selectedGlazeId}
                  size={320}
                  interactive={true}
                />
                <span className="text-[11px] font-mono-hud text-[#B7D6D3] mt-2">
                  Drag to inspect 3D carved relief
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT HALF: DETAILS (Fraunces Headings, Scrollable) ── */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-6 sm:p-10 md:p-12 overflow-y-auto">
            <div className="space-y-6 max-w-lg">
              {/* Category Label */}
              <div>
                <span className="text-xs font-mono-hud font-semibold uppercase tracking-[0.2em] text-[#42E4D0] block mb-2">
                  {isPainting ? 'EXHIBIT DETAILS' : 'PIECE DETAILS'}
                </span>

                {/* Title in Fraunces */}
                <h2
                  id="modal-artwork-title"
                  className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-white tracking-wide leading-snug"
                >
                  {isPainting ? painting.title : (pottery?.name || 'Handcrafted Pottery')}
                </h2>

                {/* Lilac-to-Rose Accent Bar */}
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#42E4D0] to-[#579AFF] mt-3" />
              </div>

              {/* Artist or Atelier Craft Line */}
              <div className="text-sm font-tagline text-[#579AFF] italic">
                {isPainting ? `By ${painting.artist}` : 'Handmade to order.'}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#B7D6D3] font-sans-ui leading-relaxed">
                {isPainting
                  ? painting.description
                  : 'Authentic Indian terracotta vessel individually thrown on the potter\'s wheel, carved with traditional geometric motifs, and sealed with custom formulated earth glazes.'}
              </p>

              {/* Pottery Glaze Selector Swatches */}
              {isPottery && glazes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-mono-hud text-[#B7D6D3] block">
                    Choose Glaze Finish:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {glazes.map((g) => {
                      const isSelected = selectedGlazeId === g.id;
                      const colorHex = GLAZE_COLORS[g.id] || '#9C4A32';
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGlazeId(g.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-[#42E4D0] bg-[#42E4D0]/20 text-white'
                              : 'border-white/10 hover:border-white/25 text-[#B7D6D3]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: colorHex }}
                          />
                          <span>{g.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="h-px bg-white/10" />

              {/* Details List */}
              <div className="space-y-2.5 text-xs font-sans-ui">
                {isPainting ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Price</span>
                      <span className="text-base font-semibold font-mono-hud text-[#579AFF]">
                        {formatINR(painting.price)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Status</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            painting.status === 'available' ? 'bg-[#F3C96B]' : 'bg-[#FF5C5C]'
                          }`}
                        />
                        <span className={painting.status === 'available' ? 'text-[#F3C96B]' : 'text-[#FF5C5C]'}>
                          {painting.status === 'available' ? 'Available for Acquisition' : 'Sold'}
                        </span>
                      </span>
                    </div>

                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Price</span>
                      <span className="text-xs text-[#B7D6D3] italic">
                        Not listed. Pottery is made on request.
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Quantity per request</span>
                      <span className="text-white font-mono-hud font-medium">1 to 12 pieces</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Curing & firing timeline</span>
                      <span className="text-white font-mono-hud font-medium">At least 14 days</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#B7D6D3]">Commission Status</span>
                      <span className="flex items-center gap-1.5 text-[#F3C96B] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#F3C96B]" />
                        <span>Open for requests</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3">
                {isPainting && (
                  <>
                    {painting.status === 'available' ? (
                      user && user.role !== 'admin' && user.role !== 'studio' ? (
                        <button
                          onClick={() => setIsCheckoutOpen(true)}
                          className="w-full py-3.5 rounded-full bg-[#42E4D0] hover:bg-[#31C8C3] text-[#06111D] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#42E4D0]/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Buy this painting</span>
                        </button>
                      ) : user?.role === 'admin' || user?.role === 'studio' ? (
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#B7D6D3] text-center">
                          Curator view: Purchase actions disabled for studio administrators.
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Log in to buy</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/25 text-xs text-[#FF5C5C] text-center">
                        This painting has found its home. It's no longer available.
                      </div>
                    )}
                  </>
                )}

                {isPottery && (
                  <button
                    onClick={handleRequestPottery}
                    className="w-full py-3.5 rounded-full bg-[#42E4D0] hover:bg-[#31C8C3] text-[#06111D] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#42E4D0]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Request this piece</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      {isPainting && (
        <CheckoutDialog
          painting={painting}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            if (onPaintingBought) onPaintingBought();
          }}
        />
      )}
    </>
  );
};
