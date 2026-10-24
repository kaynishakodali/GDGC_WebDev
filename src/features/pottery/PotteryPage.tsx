import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { BrandBar } from '../../components/BrandBar';
import { User, PotteryItem, Glaze, PotteryRequest } from '../../api/types';
import {
  listPotteryItems,
  listGlazes,
  createPotteryRequest,
  updatePotteryRequest,
  cancelPotteryRequest,
  listPotteryRequests
} from '../../services';
import {
  formatDateToKolkata,
  getKolkataDate,
  addDaysToDate
} from '../../demo-data/store';
import { Pottery3DCanvas, GLAZE_COLORS } from '../../components/Pottery3DCanvas';
import { ItemDetailModal } from '../../components/ItemDetailModal';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Calendar,
  Layers,
  X,
  Plus,
  Minus,
  Lock,
  Eye
} from 'lucide-react';

interface PotteryPageProps {
  user: User | null;
}

export const PotteryPage: React.FC<PotteryPageProps> = ({ user }) => {
  const { requestId } = useParams<{ requestId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [potteryItems, setPotteryItems] = useState<PotteryItem[]>([]);
  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [itemId, setItemId] = useState<string>('i-01');
  const [glazeId, setGlazeId] = useState<string>('g-01');
  const [quantity, setQuantity] = useState<number>(2);
  const [neededByDate, setNeededByDate] = useState<string>('');
  const [customDetails, setCustomDetails] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successResult, setSuccessResult] = useState<PotteryRequest | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockedReason, setLockedReason] = useState<string>('');
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState<boolean>(false);

  // Modal inspection for individual pottery items
  const [inspectedPottery, setInspectedPottery] = useState<PotteryItem | null>(null);

  // 14 day lead time rule (Asia/Kolkata)
  const todayStr = formatDateToKolkata(getKolkataDate());
  const minNeededDate = addDaysToDate(todayStr, 14);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [items, glazeList] = await Promise.all([
          listPotteryItems(),
          listGlazes()
        ]);
        setPotteryItems(items);
        setGlazes(glazeList);

        // Check if query params provided
        const qItem = searchParams.get('item');
        const qGlaze = searchParams.get('glaze');
        if (qItem && items.some((i) => i.id === qItem)) setItemId(qItem);
        if (qGlaze && glazeList.some((g) => g.id === qGlaze)) setGlazeId(qGlaze);

        // Set default minimum date
        setNeededByDate(minNeededDate);

        // If editing an existing request
        if (requestId) {
          const allReqs = await listPotteryRequests();
          const target = allReqs.find((r) => r.id === requestId);
          if (target) {
            setItemId(target.itemId);
            setGlazeId(target.glazeId);
            setQuantity(target.quantity);
            setNeededByDate(target.neededByDate);
            setCustomDetails(target.notes || '');

            if (target.status !== 'requested') {
              setIsLocked(true);
              setLockedReason(
                `Commission is already ${target.status}. The studio has committed materials, so modifications are locked.`
              );
            }
          } else {
            setError('Requested commission record could not be found.');
          }
        }
      } catch (err: any) {
        setError('Failed to initialize pottery customizer.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [requestId, searchParams, minNeededDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pottery' } } });
      return;
    }

    // Validation
    const errs: Record<string, string> = {};
    if (!itemId) errs.itemId = 'Please select a vessel form';
    if (!glazeId) errs.glazeId = 'Please select an authentic glaze finish';
    if (quantity < 1 || quantity > 12) errs.quantity = 'Quantity must be between 1 and 12 pieces';
    if (customDetails.length > 240) errs.notes = 'Please keep your engraving or custom details under 240 characters';
    if (!neededByDate || neededByDate < minNeededDate) {
      errs.neededByDate = `Studio requires at least 14 days of curing and firing (${minNeededDate} onwards)`;
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      if (requestId) {
        const updated = await updatePotteryRequest(requestId, {
          itemId,
          glazeId,
          quantity,
          neededByDate,
          notes: customDetails.trim()
        });
        setSuccessResult(updated);
      } else {
        const created = await createPotteryRequest({
          itemId,
          glazeId,
          quantity,
          neededByDate,
          notes: customDetails.trim()
        });
        setSuccessResult(created);
      }
    } catch (err: any) {
      if (err?.error?.fields) {
        setFieldErrors(err.error.fields);
      } else {
        setError(err?.error?.message || err?.message || 'Failed to submit pottery request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setSubmitting(true);
    try {
      await cancelPotteryRequest(requestId);
      navigate('/account');
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Could not cancel request.');
    } finally {
      setSubmitting(false);
      setIsConfirmCancelOpen(false);
    }
  };

  const selectedItemObj = potteryItems.find((i) => i.id === itemId);
  const selectedGlazeObj = glazes.find((g) => g.id === glazeId);

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui relative overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] rounded-full bg-[#087E8B]/40 blur-[130px] animate-aurora-1" />
        <div className="absolute -bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[#273469]/80 blur-[140px] animate-aurora-2" />
      </div>

      <BrandBar user={user} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-8 relative z-10">
        {successResult ? (
          <div className="rounded-[28px] bg-[#273469]/85 backdrop-blur-2xl border border-white/15 p-8 sm:p-12 shadow-2xl text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD65A]/20 border border-[#FFD65A]/40 flex items-center justify-center text-[#FFD65A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono-hud text-[#FFD65A] uppercase tracking-widest font-semibold">
                Status: Requested
              </span>
              <h2 className="text-3xl font-display font-light text-white tracking-wide">
                Pottery Commission Registered
              </h2>
              <p className="text-xs sm:text-sm text-[#E3D0BE] max-w-md mx-auto leading-relaxed">
                Your commission for {successResult.quantity}× {successResult.itemName} finished in {successResult.glazeName} has been queued at the kiln.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#28201C]/60 border border-white/10 max-w-sm mx-auto text-xs space-y-2 text-left">
              {successResult.notes && (
                <div className="border-t border-white/10 pt-2">
                  <span className="text-[#E3D0BE]">Customization:</span>
                  <p className="mt-1 text-white whitespace-pre-wrap break-words">{successResult.notes}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#E3D0BE]">Target Delivery Date</span>
                <span className="text-white font-mono-hud">{successResult.neededByDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E3D0BE]">Reference Request ID</span>
                <span className="text-white font-mono-hud">{successResult.id}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                to="/account"
                className="px-7 py-3 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Track in Dashboard
              </Link>
              <Link
                to="/gallery"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10"
              >
                Back to Gallery
              </Link>
            </div>
          </div>
        ) : isLocked ? (
          <div className="rounded-[28px] bg-[#273469]/85 backdrop-blur-2xl border border-amber-500/30 p-8 sm:p-12 shadow-2xl text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-display font-light text-white">Commission In Progress</h2>
            <p className="text-xs text-[#E3D0BE]">{lockedReason}</p>
            <Link
              to="/account"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
            >
              Return to Collector Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono-hud text-[#F4A900] uppercase tracking-widest block mb-1">
                  Wheel-Thrown Terracotta & Slipware
                </span>
                <h1 className="text-3xl sm:text-4xl font-display font-light text-white tracking-wide">
                  {requestId ? 'Modify Pottery Request' : 'Custom Pottery Commission'}
                </h1>
                <p className="text-xs text-[#E3D0BE] mt-1">
                  Each piece is shaped by hand, decorated with relief carvings, and fired in the wood-kiln.
                </p>
              </div>

              {requestId && (
                <button
                  type="button"
                  onClick={() => setIsConfirmCancelOpen(true)}
                  className="px-4 py-2 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-all cursor-pointer"
                >
                  Cancel Commission
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Left 7 Cols: Form Configurator ── */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
                {/* 1. Choose Seed Pottery Form */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono-hud text-[#F4A900] uppercase tracking-wider font-semibold">
                    1. Select Vessel Silhouette
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {potteryItems.map((item) => {
                      const isSelected = itemId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setItemId(item.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#F4A900]/15 border-[#F4A900] shadow-md ring-1 ring-[#F4A900]/30'
                              : 'bg-[#273469]/60 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="font-display font-light text-sm text-white truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-[#E3D0BE] block mt-0.5">
                              Handmade to order
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedPottery(item);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F4A900] hover:text-white transition-colors"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Choose Earth Glaze Swatch */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono-hud text-[#F4A900] uppercase tracking-wider font-semibold">
                    2. Choose Earth Glaze Swatch
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {glazes.map((g) => {
                      const isSelected = glazeId === g.id;
                      const colorHex = GLAZE_COLORS[g.id] || '#9C4A32';
                      return (
                        <div
                          key={g.id}
                          onClick={() => setGlazeId(g.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-[#F4A900]/15 border-[#F4A900] shadow-sm'
                              : 'bg-[#273469]/60 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <span className="text-xs text-[#FFF5E6] font-medium truncate">
                            {g.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quantity Stepper (1 to 12) & Needed-by Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono-hud text-[#F4A900] uppercase tracking-wider font-semibold">
                      3. Quantity (1–12 pieces)
                    </label>
                    <div className="flex items-center gap-3 bg-[#28201C] border border-white/15 p-1 rounded-2xl w-fit">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono-hud font-bold text-base px-3 text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(12, q + 1))}
                        disabled={quantity >= 12}
                        className="p-2 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono-hud text-[#F4A900] uppercase tracking-wider font-semibold">
                      4. Target Delivery (≥14 Days)
                    </label>
                    <input
                      type="date"
                      min={minNeededDate}
                      value={neededByDate}
                      onChange={(e) => setNeededByDate(e.target.value)}
                      className="w-full bg-[#28201C] border border-white/15 focus:border-[#F4A900] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer"
                    />
                    {fieldErrors.neededByDate && (
                      <p className="text-[11px] text-[#FF5C5C] font-mono-hud">{fieldErrors.neededByDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="custom-details" className="block text-xs font-mono-hud text-[#F4A900] uppercase tracking-wider font-semibold">
                    Engraving or custom details <span className="normal-case tracking-normal text-[#E3D0BE]">(optional)</span>
                  </label>
                  <textarea
                    id="custom-details"
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    maxLength={240}
                    rows={3}
                    placeholder="Add a name, date, motif, or other detail for the studio..."
                    className="w-full resize-y bg-[#28201C] border border-white/15 focus:border-[#F4A900] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[#77758B] outline-none focus:ring-1 focus:ring-[#F4A900]"
                  />
                  <div className="flex justify-between text-[11px] text-[#E3D0BE]">
                    {fieldErrors.notes ? <span className="text-[#FF5C5C]">{fieldErrors.notes}</span> : <span>Text is sent as a studio instruction; the preview does not render engraving.</span>}
                    <span>{customDetails.length}/240</span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#F4A900]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting to Atelier...</span>
                  ) : (
                    <>
                      <span>{requestId ? 'Update Commission Request' : 'Place Commission Request'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* ── Right 5 Cols: Live Interactive 3D Preview ── */}
              <div className="lg:col-span-5 rounded-[26px] bg-[#273469]/70 backdrop-blur-xl border border-white/15 p-6 shadow-2xl space-y-4 text-center sticky top-28">
                <span className="text-[10px] font-mono-hud text-[#F4A900] uppercase tracking-widest block">
                  Kiln Render Preview
                </span>

                <div className="w-full h-72 bg-[#28201C] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5">
                  <Pottery3DCanvas
                    itemId={itemId}
                    glazeId={glazeId}
                    size={280}
                    interactive={true}
                  />
                </div>

                <div className="text-left p-4 rounded-2xl bg-[#28201C]/50 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#E3D0BE]">Form:</span>
                    <span className="text-white font-medium">{selectedItemObj?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E3D0BE]">Glaze Finish:</span>
                    <span className="text-white font-medium">{selectedGlazeObj?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E3D0BE]">Quantity:</span>
                    <span className="text-white font-mono-hud">{quantity} pieces</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E3D0BE]">Production Cycle:</span>
                    <span className="text-[#FFD65A] font-mono-hud font-medium">14 days minimum</span>
                  </div>
                  {customDetails.trim() && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[#E3D0BE]">Custom details:</span>
                  <p className="mt-1 text-white whitespace-pre-wrap break-words">{customDetails.trim()}</p>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 text-[11px] text-[#E3D0BE] italic">
                    Pottery prices are quoted on request following clay volume and glaze inspection.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog for Request Cancellation */}
      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] bg-[#273469] border border-white/15 p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-display text-white">Cancel Commission?</h3>
            <p className="text-xs text-[#E3D0BE]">
              Are you sure you want to withdraw this pottery request from the studio queue?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsConfirmCancelOpen(false)}
                className="px-4 py-2 rounded-full border border-white/15 text-xs text-white"
              >
                Keep Request
              </button>
              <button
                onClick={handleCancelRequest}
                className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Inspecting Pottery Items */}
      {inspectedPottery && (
        <ItemDetailModal
          isOpen={true}
          onClose={() => setInspectedPottery(null)}
          type="pottery"
          pottery={inspectedPottery}
          glazes={glazes}
          user={user}
        />
      )}
    </div>
  );
};
