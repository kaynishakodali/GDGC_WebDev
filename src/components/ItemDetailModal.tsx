import React, { useState, useEffect } from 'react';
import { Painting, PotteryItem, Glaze, User } from '../api/types';
import { formatINR } from '../demo-data/store';
import { Pottery3DCanvas, GLAZE_COLORS } from './Pottery3DCanvas';
import { CheckoutDialog } from './CheckoutDialog';
import { useNavigate } from 'react-router-dom';
import { getPainting, placePaintingBid } from '../services';
import { useCart } from './CartContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Layers,
  ArrowRight,
  ShoppingCart
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
  onPaintingBid?: () => void;
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
  onPaintingBought,
  onPaintingBid
}) => {
  const navigate = useNavigate();
  const { itemIds, addItem } = useCart();
  const [selectedGlazeId, setSelectedGlazeId] = useState<string>('g-01');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [auctionUpdate, setAuctionUpdate] = useState<Partial<Painting> | null>(null);

  useEffect(() => {
    setAuctionUpdate(null);
    setBidError('');
    setBidAmount('');
  }, [painting?.id]);

  useEffect(() => {
    if (!isOpen || !painting || painting.saleMode !== 'auction') return;
    let active = true;
    const refreshAuction = () => {
      getPainting(painting.id).then((latest) => {
        if (active) setAuctionUpdate(latest);
      }).catch(() => undefined);
    };
    refreshAuction();
    const timer = window.setInterval(refreshAuction, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isOpen, painting?.id, painting?.saleMode]);

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
  const currentPainting = isPainting ? { ...painting, ...auctionUpdate } : null;
  const minimumBid = currentPainting?.currentBid == null ? currentPainting?.price ?? 0 : currentPainting.currentBid + 1;

  const handlePlaceBid = async () => {
    if (!currentPainting) return;
    const amount = Number(bidAmount);
    if (!Number.isSafeInteger(amount) || amount < minimumBid) {
      setBidError(`Enter a whole-rupee bid of at least ${formatINR(minimumBid)}.`);
      return;
    }
    setIsBidding(true);
    setBidError('');
    try {
      const result = await placePaintingBid(currentPainting.id, amount);
      setAuctionUpdate(result.painting);
      setBidAmount('');
      onPaintingBid?.();
    } catch (error: any) {
      setBidError(error?.error?.message || error?.message || 'Your bid could not be placed. Refresh and try again.');
    } finally {
      setIsBidding(false);
    }
  };

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
        <div className="relative w-full max-w-[1180px] h-full max-h-[88vh] rounded-[28px] bg-[#273469] border border-white/15 shadow-2xl flex flex-col md:flex-row overflow-hidden text-[#FFF5E6]">
          {/* Top Iridescent Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F4A900] via-[#087E8B] to-[#477A45] z-20" />

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
          <div className="w-full md:w-1/2 h-72 md:h-full relative overflow-hidden bg-[#28201C] flex items-center justify-center p-4 sm:p-8">
            {isPainting && (
              <>
                {/* Enlarged blurred ambient backdrop */}
                <img
                  src={currentPainting!.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125 pointer-events-none"
                />

                {/* Main Artwork: 100% true proportions without cropping */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img
                    src={currentPainting!.imageUrl}
                    alt={currentPainting!.title}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                  />
                  {currentPainting!.status === 'sold' && (
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
                <span className="text-[11px] font-mono-hud text-[#E3D0BE] mt-2">
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
                <span className="text-xs font-mono-hud font-semibold uppercase tracking-[0.2em] text-[#F4A900] block mb-2">
                  {isPainting ? 'EXHIBIT DETAILS' : 'PIECE DETAILS'}
                </span>

                {/* Title in Fraunces */}
                <h2
                  id="modal-artwork-title"
                  className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-white tracking-wide leading-snug"
                >
                  {isPainting ? currentPainting!.title : (pottery?.name || 'Handcrafted Pottery')}
                </h2>

                {/* Lilac-to-Rose Accent Bar */}
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#F4A900] to-[#087E8B] mt-3" />
              </div>

              {/* Artist or Atelier Craft Line */}
              <div className="text-sm font-tagline text-[#087E8B] italic">
                {isPainting ? `By ${currentPainting!.artist}` : 'Handmade to order.'}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#E3D0BE] font-sans-ui leading-relaxed">
                {isPainting
                  ? currentPainting!.description
                  : 'Authentic Indian terracotta vessel individually thrown on the potter\'s wheel, carved with traditional geometric motifs, and sealed with custom formulated earth glazes.'}
              </p>

              {/* Pottery Glaze Selector Swatches */}
              {isPottery && glazes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-mono-hud text-[#E3D0BE] block">
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
                              ? 'border-[#F4A900] bg-[#F4A900]/20 text-white'
                              : 'border-white/10 hover:border-white/25 text-[#E3D0BE]'
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
                      <span className="text-[#E3D0BE]">{currentPainting!.saleMode === 'auction' ? (currentPainting!.currentBid == null ? 'Opening bid' : 'Current bid') : 'Price'}</span>
                      <span className="text-base font-semibold font-mono-hud text-[#087E8B]">
                        {formatINR(currentPainting!.saleMode === 'auction' ? (currentPainting!.currentBid ?? currentPainting!.price) : currentPainting!.price)}
                      </span>
                    </div>

                    {currentPainting!.saleMode === 'auction' && (
                      <>
                        <div className="flex justify-between items-center text-[#E3D0BE]"><span>Bids placed</span><span>{currentPainting!.bidCount ?? 0}</span></div>
                        <div className="flex justify-between items-center text-[#E3D0BE]"><span>Auction ends</span><span>{currentPainting!.auctionEndsAt ? new Date(currentPainting!.auctionEndsAt).toLocaleString() : 'Not scheduled'}</span></div>
                        {currentPainting!.auctionOpen && <p className="text-[11px] text-[#E3D0BE]">Minimum next bid: {formatINR(minimumBid)}</p>}
                        {currentPainting!.auctionOpen && user?.role === 'customer' && (
                          <div className="space-y-2 pt-2">
                            <div className="flex gap-2">
                              <input type="number" min={minimumBid} step="1" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} aria-label="Your bid in rupees" placeholder={`At least ₹${minimumBid}`} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#F4A900]" />
                              <button type="button" onClick={handlePlaceBid} disabled={isBidding} className="rounded-xl bg-[#F4A900] px-4 py-2 text-xs font-bold text-[#28201C] disabled:opacity-60">{isBidding ? 'Placing…' : 'Place bid'}</button>
                            </div>
                            {bidError && <p role="alert" className="text-xs text-[#FF8C91]">{bidError}</p>}
                          </div>
                        )}
                        {currentPainting!.auctionOpen && !user && <p className="text-xs text-[#E3D0BE]">Sign in as a customer to place a bid.</p>}
                        {!currentPainting!.auctionOpen && currentPainting!.isHighestBidder && <p className="text-xs text-[#F4A900]">You hold the winning bid. Complete checkout to reserve this artwork.</p>}
                        {!currentPainting!.auctionOpen && !currentPainting!.isHighestBidder && <p className="text-xs text-[#E3D0BE]">Bidding is closed.</p>}
                      </>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[#E3D0BE]">Status</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            currentPainting!.status === 'available' ? 'bg-[#FFD65A]' : 'bg-[#FF5C5C]'
                          }`}
                        />
                        <span className={currentPainting!.status === 'available' ? 'text-[#FFD65A]' : 'text-[#FF5C5C]'}>
                          {currentPainting!.status === 'available' ? 'Available for Acquisition' : 'Sold'}
                        </span>
                      </span>
                    </div>

                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#E3D0BE]">Price</span>
                      <span className="text-xs text-[#E3D0BE] italic">
                        Not listed. Pottery is made on request.
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#E3D0BE]">Quantity per request</span>
                      <span className="text-white font-mono-hud font-medium">1 to 12 pieces</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#E3D0BE]">Curing & firing timeline</span>
                      <span className="text-white font-mono-hud font-medium">At least 14 days</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#E3D0BE]">Commission Status</span>
                      <span className="flex items-center gap-1.5 text-[#FFD65A] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#FFD65A]" />
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
                    {currentPainting!.status === 'available' ? (
                      user && user.role === 'customer' ? (
                        currentPainting!.saleMode === 'auction' ? (
                          !currentPainting!.auctionOpen && currentPainting!.isHighestBidder ? (
                            <button onClick={() => setIsCheckoutOpen(true)} className="w-full py-3.5 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4A900]/20 flex items-center justify-center gap-2 cursor-pointer"><ShoppingBag className="w-4 h-4" /><span>Complete winning bid checkout</span></button>
                          ) : null
                        ) : (
                          <><button type="button" onClick={() => addItem(currentPainting!.id)} disabled={itemIds.includes(currentPainting!.id)} className="mb-2 w-full rounded-full border border-[#FFD65A]/40 bg-[#FFD65A]/10 py-3 text-xs font-bold uppercase tracking-wider text-[#FFD65A] transition hover:bg-[#FFD65A]/20 disabled:cursor-default disabled:opacity-75">{itemIds.includes(currentPainting!.id) ? "✓ Added to your bag" : <><ShoppingCart className="mr-2 inline h-4 w-4" />Add to art bag</>}</button><button onClick={() => setIsCheckoutOpen(true)} className="w-full py-3.5 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4A900]/20 flex items-center justify-center gap-2 cursor-pointer"><ShoppingBag className="w-4 h-4" /><span>Buy this painting</span></button></>
                        )
                      ) : user?.role === 'studio' ? (
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#E3D0BE] text-center">
                          Curator view: Purchase actions disabled for studio administrators.
                        </div>
                      ) : (
                        <>
                          {currentPainting!.saleMode === 'fixed' && <button type="button" onClick={() => addItem(currentPainting!.id)} disabled={itemIds.includes(currentPainting!.id)} className="mb-2 w-full rounded-full border border-[#FFD65A]/40 bg-[#FFD65A]/10 py-3 text-xs font-bold uppercase tracking-wider text-[#FFD65A] transition hover:bg-[#FFD65A]/20 disabled:cursor-default disabled:opacity-75">{itemIds.includes(currentPainting!.id) ? '✓ Added to your bag' : <><ShoppingCart className="mr-2 inline h-4 w-4" />Add to art bag</>}</button>}
                          <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>{currentPainting!.saleMode === 'auction' ? 'Log in to bid' : 'Sign in to checkout'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
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
                    className="w-full py-3.5 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4A900]/20 flex items-center justify-center gap-2 cursor-pointer"
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
          painting={currentPainting!.saleMode === 'auction' ? { ...currentPainting!, price: currentPainting!.currentBid ?? currentPainting!.price } : currentPainting!}
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
