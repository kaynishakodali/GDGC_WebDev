export type StudioRole = 'customer' | 'studio' | 'admin';

export function hasAnyRole(role: StudioRole, allowed: readonly StudioRole[]) {
  return allowed.includes(role);
}

export function ownsResource(actorId: string, ownerId: string) {
  return actorId === ownerId;
}

export function kolkataDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function shiftIsoDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function dateRangeError(date: string, minDays: number, maxDays: number, today = kolkataDate()) {
  const earliest = shiftIsoDate(today, minDays);
  const latest = shiftIsoDate(today, maxDays);
  return date >= earliest && date <= latest ? null : `Date must be from ${earliest} through ${latest}.`;
}

export function calculateMuralTotal(sizeSqFt: number, ratePerSqFt: number) {
  return sizeSqFt * ratePerSqFt;
}

export function canPurchasePainting(status: 'available' | 'sold', hasActiveOrder: boolean) {
  return status === 'available' && !hasActiveOrder;
}
