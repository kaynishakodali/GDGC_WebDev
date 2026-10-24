import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandBar } from '../../components/BrandBar';
import { User, WallBooking } from '../../api/types';
import {
  getUnavailableMuralDates,
  getMuralConfig,
  createMuralBooking
} from '../../services';
import {
  formatDateToKolkata,
  getKolkataDate,
  addDaysToDate,
  formatINR
} from '../../demo-data/store';
import {
  Calendar as CalendarIcon,
  Maximize,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface WallBookingProps {
  user: User | null;
}

export const WallBookingPage: React.FC<WallBookingProps> = ({ user }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [ratePerSqFt, setRatePerSqFt] = useState<number>(150);

  // Form State
  const [date, setDate] = useState<string>('');
  const [sizeSqFt, setSizeSqFt] = useState<number>(120);
  const [address, setAddress] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bookingSuccess, setBookingSuccess] = useState<WallBooking | null>(null);

  // Kolkata reference dates
  const todayStr = formatDateToKolkata(getKolkataDate());
  const minDateStr = addDaysToDate(todayStr, 7);
  const maxDateStr = addDaysToDate(todayStr, 90);

  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const fetchDatesAndRate = async () => {
    try {
      const [dates, config] = await Promise.all([
        getUnavailableMuralDates(),
        getMuralConfig()
      ]);
      setUnavailableDates(dates);
      setRatePerSqFt(config.ratePerSqFt);
    } catch {}
  };

  useEffect(() => {
    fetchDatesAndRate();
  }, []);

  // Calendar generation helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startDay = firstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty lead slots
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-12" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = unavailableDates.includes(dStr);
      const isOutOfRange = dStr < minDateStr || dStr > maxDateStr;
      const isDisabled = isBooked || isOutOfRange;
      const isSelected = date === dStr;

      days.push(
        <button
          key={dStr}
          type="button"
          disabled={isDisabled}
          onClick={() => {
            setDate(dStr);
            setFieldErrors((prev) => ({ ...prev, date: '' }));
          }}
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-mono-hud transition-all relative flex flex-col items-center justify-center cursor-pointer ${
            isSelected
              ? 'bg-[#F4A900] text-[#28201C] font-bold shadow-lg shadow-[#F4A900]/20 scale-105 z-10'
              : isBooked
              ? 'bg-rose-500/10 text-rose-400/40 border border-rose-500/10 cursor-not-allowed'
              : isOutOfRange
              ? 'text-zinc-600 cursor-not-allowed opacity-30'
              : 'text-[#FFF5E6] hover:bg-white/10 hover:border-white/20 border border-white/5'
          }`}
        >
          <span>{day}</span>
          {isBooked && (
            <span className="text-[8px] font-mono tracking-tighter text-rose-400">
              Booked
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  const handleNextStep = () => {
    setError(null);
    setFieldErrors({});

    if (step === 1) {
      if (!date) {
        setFieldErrors({ date: 'Please select an available date for the studio mural team' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (sizeSqFt < 10 || sizeSqFt > 500) {
        setFieldErrors({ sizeSqFt: 'Wall area must be between 10 and 500 square feet' });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address.trim() || address.trim().length < 10) {
        setFieldErrors({ address: 'Please provide full on-site installation address (minimum 10 characters)' });
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/wall' } } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createMuralBooking({
        date,
        sizeSqFt,
        address
      });
      setBookingSuccess(res);
    } catch (err: any) {
      if (err?.status === 409) {
        // Someone booked that date right before
        await fetchDatesAndRate();
        setStep(1);
        setDate('');
        setError('Someone just booked that date. Please pick another date from the calendar.');
      } else if (err?.error?.fields) {
        setFieldErrors(err.error.fields);
      } else {
        setError(err?.error?.message || err?.message || 'Failed to submit mural booking request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = sizeSqFt * ratePerSqFt;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui relative overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-[#087E8B]/50 blur-[140px] animate-aurora-1" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[#273469]/80 blur-[130px] animate-aurora-2" />
      </div>

      <BrandBar user={user} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 py-8 relative z-10 flex flex-col justify-center">
        {bookingSuccess ? (
          <div className="rounded-[28px] bg-[#273469]/85 backdrop-blur-2xl border border-white/15 p-8 sm:p-12 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD65A]/20 border border-[#FFD65A]/40 flex items-center justify-center text-[#FFD65A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono-hud text-[#FFD65A] uppercase tracking-widest font-semibold">
                Status: Requested
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-light text-white tracking-wide">
                Mural Date Reserved
              </h2>
              <p className="text-xs sm:text-sm text-[#E3D0BE] max-w-md mx-auto leading-relaxed">
                Your architectural wall commission is scheduled for{' '}
                <strong className="text-white font-mono-hud">{bookingSuccess.date}</strong>. The lead muralist will contact you to inspect wall texture and verify design concepts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#28201C]/60 border border-white/10 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#E3D0BE]">Surface Area</span>
                <span className="text-white font-mono-hud">{bookingSuccess.sizeSqFt} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E3D0BE]">Rate Applied</span>
                <span className="text-white font-mono-hud">₹{bookingSuccess.ratePerSqFt}/sq ft</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                <span className="text-white">Estimated Investment</span>
                <span className="text-[#E34234] font-mono-hud">{formatINR(bookingSuccess.totalPrice)}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
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
                Return to Gallery
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] bg-[#273469]/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F4A900] via-[#087E8B] to-[#477A45]" />

            {/* Stepper Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono-hud text-[#F4A900] uppercase tracking-widest block">
                    Site-Specific Architectural Commission
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-light text-white tracking-wide">
                    Book an On-Site Mural
                  </h1>
                </div>

                <span className="text-xs font-mono-hud text-[#E3D0BE] hidden sm:block">
                  Step {step} of 4
                </span>
              </div>

              {/* Step Pills */}
              <div className="grid grid-cols-4 gap-2 text-xs font-mono-hud">
                {[
                  { n: 1, label: 'Date' },
                  { n: 2, label: 'Wall Area' },
                  { n: 3, label: 'Address' },
                  { n: 4, label: 'Review' }
                ].map((s) => (
                  <div
                    key={s.n}
                    className={`py-2 text-center rounded-xl transition-all ${
                      step === s.n
                        ? 'bg-[#F4A900] text-[#28201C] font-bold shadow-md'
                        : step > s.n
                        ? 'bg-white/10 text-[#FFD65A]'
                        : 'bg-white/5 text-[#E3D0BE]'
                    }`}
                  >
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: DATE CALENDAR (7 to 90 days Asia/Kolkata) */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Select Installation Date</h3>
                    <p className="text-xs text-[#E3D0BE]">
                      Available from 7 days ({minDateStr}) to 90 days ahead.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono-hud text-xs text-white min-w-[120px] text-center">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono-hud text-[11px] text-zinc-500 mb-1">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {renderCalendar()}
                </div>

                {fieldErrors.date && (
                  <p className="text-xs text-[#FF5C5C] font-mono-hud">{fieldErrors.date}</p>
                )}

                {date && (
                  <div className="p-3.5 rounded-2xl bg-[#28201C]/60 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#E3D0BE]">Selected Calendar Date:</span>
                    <span className="text-[#FFD65A] font-mono-hud font-bold">{date}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: WALL SIZE SLIDER (10 to 500 sq ft) */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Wall Dimensions & Rate Calculation</h3>
                  <p className="text-xs text-[#E3D0BE]">
                    Define total wall surface area in square feet. Rate: ₹{ratePerSqFt}/sq ft.
                  </p>
                </div>

                {/* Animated Interactive Wall Preview Box */}
                <div className="w-full h-44 rounded-2xl bg-[#28201C] border border-white/10 flex items-center justify-center p-6 relative overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(90, Math.max(25, (sizeSqFt / 500) * 85 + 20))}%`,
                      height: '75%'
                    }}
                    className="rounded-xl border-2 border-dashed border-[#F4A900] bg-[#F4A900]/10 flex flex-col items-center justify-center transition-all duration-300 relative shadow-inner"
                  >
                    <span className="font-mono-hud text-lg font-bold text-white">
                      {sizeSqFt} sq ft
                    </span>
                    <span className="text-[10px] text-[#E3D0BE] mt-0.5">Scale Representation</span>
                  </div>
                </div>

                {/* Synced Slider & Numeric Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="5"
                      value={sizeSqFt}
                      onChange={(e) => setSizeSqFt(Number(e.target.value))}
                      className="flex-1 accent-[#F4A900] cursor-pointer h-2"
                    />
                    <div className="flex items-center gap-1.5 bg-[#28201C] border border-white/15 px-3 py-1.5 rounded-xl font-mono-hud text-sm">
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={sizeSqFt}
                        onChange={(e) => setSizeSqFt(Math.min(500, Math.max(10, Number(e.target.value))))}
                        className="w-16 bg-transparent text-white outline-none text-right"
                      />
                      <span className="text-zinc-500 text-xs">sq ft</span>
                    </div>
                  </div>

                  {/* Exact prompt formula: "Rate: ₹{ratePerSqFt}/sq ft × {size} = ₹{total}" */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#273469] to-[#087E8B] border border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono-hud">
                    <span className="text-[#E3D0BE]">
                      Rate: ₹{ratePerSqFt}/sq ft × {sizeSqFt} =
                    </span>
                    <span className="text-xl font-bold text-[#E34234] animate-pulse">
                      {formatINR(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADDRESS */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Installation Address</h3>
                  <p className="text-xs text-[#E3D0BE]">
                    Provide full on-site physical address where scaffolding and muralists will deploy.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    placeholder="Enter complete building name, flat/villa number, street, locality, city and postal PIN code..."
                    className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#F4A900] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#F4A900]"
                  />
                  {fieldErrors.address && (
                    <p className="text-xs text-[#FF5C5C] font-mono-hud mt-1.5">{fieldErrors.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Review Mural Commission</h3>
                  <p className="text-xs text-[#E3D0BE]">
                    Please verify your chosen date and site specifications before final submission.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#28201C]/60 border border-white/10 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#E3D0BE]">Execution Date</span>
                    <span className="font-mono-hud font-bold text-white">{date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#E3D0BE]">Wall Surface</span>
                    <span className="font-mono-hud text-white">{sizeSqFt} square feet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#E3D0BE]">Rate Formula</span>
                    <span className="font-mono-hud text-[#E3D0BE]">₹{ratePerSqFt}/sq ft × {sizeSqFt}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Total Investment</span>
                    <span className="font-mono-hud text-[#E34234] text-lg">{formatINR(totalPrice)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-[#E3D0BE] space-y-1">
                  <span className="text-white font-medium block">Site Location:</span>
                  <p className="font-sans-ui">{address}</p>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-xs text-[#E3D0BE] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-7 py-2.5 rounded-full bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-full bg-[#FFD65A] hover:bg-[#D7A85B] text-[#28201C] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FFD65A]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Mural Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
