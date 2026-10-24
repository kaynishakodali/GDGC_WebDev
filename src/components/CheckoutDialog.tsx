import React, { useState, useEffect } from 'react';
import { Painting, ShippingAddress } from '../api/types';
import { buyPainting, listOrders } from '../services';
import { formatINR } from '../demo-data/store';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock
} from 'lucide-react';

interface CheckoutDialogProps {
  painting: Painting;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  painting,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'review' | 'shipping' | 'confirm'>('review');
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Karnataka',
    pincode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Prefill from customer's previous order via service (not localStorage)
  useEffect(() => {
    if (isOpen) {
      listOrders().then((orders) => {
        if (orders.length > 0 && orders[0].shipping) {
          setShipping(orders[0].shipping);
        }
      }).catch(() => {});
      setStep('review');
      setIsSuccess(false);
      setGeneralError(null);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!shipping.fullName?.trim()) errs.fullName = 'Full name is required';
    if (!shipping.phone.trim() || !/^[6-9]\d{9}$/.test(shipping.phone.trim())) {
      errs.phone = '10-digit Indian mobile number starting 6–9 is required';
    }
    if (!shipping.line1?.trim()) errs.line1 = 'Address Line 1 is required';
    if (!shipping.city.trim()) errs.city = 'City is required';
    if (!shipping.state.trim()) errs.state = 'State is required';
    if (!shipping.pincode.trim() || !/^\d{6}$/.test(shipping.pincode.trim())) {
      errs.pincode = '6-digit postal PIN code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 'review') {
      setStep('shipping');
    } else if (step === 'shipping') {
      if (validateShipping()) {
        setStep('confirm');
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      await buyPainting({
        paintingId: painting.id,
        shipping
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err: any) {
      if (err?.error?.fields) {
        setErrors(err.error.fields);
        setStep('shipping');
      }
      setGeneralError(err?.error?.message || err?.message || 'Acquisition could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-[28px] bg-[#273469] border border-white/15 p-6 sm:p-8 shadow-2xl text-[#FFF5E6] overflow-hidden">
        {/* Top Iridescent Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F4A900] via-[#087E8B] to-[#477A45]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono-hud uppercase tracking-widest text-[#F4A900]">
              Original Artwork Acquisition
            </span>
            <h3 id="checkout-title" className="text-xl font-display font-light text-white">
              {isSuccess ? 'Acquisition Confirmed' : 'Art Acquisition Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#E3D0BE] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generalError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD65A]/20 border border-[#FFD65A]/40 flex items-center justify-center text-[#FFD65A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-display font-light text-white">
                Original Artwork Reserved
              </h4>
              <p className="text-xs text-[#E3D0BE] max-w-sm mx-auto">
                Provenance has been registered. The studio will contact you to coordinate insured white-glove transport to {shipping.city}.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 text-xs font-mono-hud text-[#E3D0BE]">
              <span className={`px-2.5 py-0.5 rounded-full ${step === 'review' ? 'bg-[#F4A900] text-[#28201C] font-bold' : 'bg-white/5'}`}>
                1. Review
              </span>
              <span>→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${step === 'shipping' ? 'bg-[#F4A900] text-[#28201C] font-bold' : 'bg-white/5'}`}>
                2. Shipping
              </span>
              <span>→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${step === 'confirm' ? 'bg-[#F4A900] text-[#28201C] font-bold' : 'bg-white/5'}`}>
                3. Finalize
              </span>
            </div>

            {/* STEP 1: REVIEW */}
            {step === 'review' && (
              <div className="space-y-4">
                <div className="flex gap-4 p-3.5 rounded-2xl bg-[#28201C]/60 border border-white/10 items-center">
                  <img
                    src={painting.imageUrl}
                    alt={painting.title}
                    className="w-20 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-light text-base text-white truncate">
                      {painting.title}
                    </h4>
                    <p className="text-xs text-[#E3D0BE] truncate">By {painting.artist}</p>
                    <p className="text-sm font-semibold text-[#087E8B] mt-1 font-mono-hud">
                      {formatINR(painting.price)}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-[#E3D0BE] space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#FFD65A]" />
                    <span>Single-Edition Original Guarantee</span>
                  </div>
                  <p>
                    No payment is taken here. The studio will review and contact you directly to arrange customized transit and payment details.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING DETAILS */}
            {step === 'shipping' && (
              <div className="space-y-3.5 text-xs max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[#E3D0BE] mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="Ananya Sharma"
                  />
                  {errors.fullName && <p className="text-[#FF5C5C] text-[11px] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-[#E3D0BE] mb-1 font-medium">Phone Number (10 digits) *</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-[#FF5C5C] text-[11px] mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-[#E3D0BE] mb-1 font-medium">Address Line 1 *</label>
                  <input
                    type="text"
                    autoComplete="address-line1"
                    value={shipping.line1}
                    onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                    className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="House/Flat No, Apartment or Street"
                  />
                  {errors.line1 && <p className="text-[#FF5C5C] text-[11px] mt-1">{errors.line1}</p>}
                </div>

                <div>
                  <label className="block text-[#E3D0BE] mb-1 font-medium">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    autoComplete="address-line2"
                    value={shipping.line2 || ''}
                    onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                    className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="Landmark, Area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#E3D0BE] mb-1 font-medium">City *</label>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                      placeholder="Bengaluru"
                    />
                    {errors.city && <p className="text-[#FF5C5C] text-[11px] mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-[#E3D0BE] mb-1 font-medium">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                      className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                      placeholder="560038"
                    />
                    {errors.pincode && <p className="text-[#FF5C5C] text-[11px] mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[#E3D0BE] mb-1 font-medium">State *</label>
                  <select
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full bg-[#28201C] border border-white/15 focus:border-[#F4A900] rounded-xl px-3.5 py-2 text-white outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-[#28201C] text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM */}
            {step === 'confirm' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#28201C]/60 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-medium">Original Artwork</span>
                    <span className="font-mono-hud font-semibold text-[#087E8B]">{formatINR(painting.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#E3D0BE]">
                    <span>Transit Packaging</span>
                    <span className="text-[#FFD65A]">Complimentary</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Investment</span>
                    <span className="font-mono-hud text-[#F4A900]">{formatINR(painting.price)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-[#E3D0BE]">
                  <span className="text-white font-medium block">Delivery Destination:</span>
                  <p>{shipping.fullName} • {shipping.phone}</p>
                  <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}</p>
                  <p>{shipping.city}, {shipping.state} — {shipping.pincode}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              {step !== 'review' ? (
                <button
                  type="button"
                  onClick={() => setStep(step === 'confirm' ? 'shipping' : 'review')}
                  className="px-4 py-2 rounded-full border border-white/15 text-xs text-[#E3D0BE] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step !== 'confirm' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-7 py-2.5 rounded-full bg-[#FFD65A] hover:bg-[#D7A85B] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FFD65A]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm Acquisition</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
