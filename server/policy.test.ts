import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMuralTotal, canPurchasePainting, dateRangeError, hasAnyRole, ownsResource, shiftIsoDate } from './policy.js';
import { createSessionToken, hashSessionToken, isSessionExpired, sessionExpiry } from './session.js';

test('authentication sessions use random opaque tokens and store only a one-way digest', () => {
  const first = createSessionToken();
  const second = createSessionToken();
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.notEqual(hashSessionToken(first), first);
  assert.equal(hashSessionToken(first), hashSessionToken(first));
});

test('authentication session expiry is enforced at the exact expiry boundary', () => {
  const now = Date.UTC(2026, 9, 24);
  assert.equal(sessionExpiry(now).getTime(), now + 8 * 60 * 60 * 1000);
  assert.equal(isSessionExpired(new Date(now + 1), now), false);
  assert.equal(isSessionExpired(new Date(now), now), true);
});

test('role policy grants studio access only to studio and admin roles', () => {
  assert.equal(hasAnyRole('studio', ['studio', 'admin']), true);
  assert.equal(hasAnyRole('admin', ['studio', 'admin']), true);
  assert.equal(hasAnyRole('customer', ['studio', 'admin']), false);
});

test('ownership policy isolates customer records', () => {
  assert.equal(ownsResource('customer-1', 'customer-1'), true);
  assert.equal(ownsResource('customer-1', 'customer-2'), false);
});

test('booking date policy allows inclusive 7 and 90 day bounds', () => {
  const today = '2026-10-24';
  assert.equal(dateRangeError(shiftIsoDate(today, 7), 7, 90, today), null);
  assert.equal(dateRangeError(shiftIsoDate(today, 90), 7, 90, today), null);
  assert.ok(dateRangeError(shiftIsoDate(today, 6), 7, 90, today));
  assert.ok(dateRangeError(shiftIsoDate(today, 91), 7, 90, today));
});

test('mural total is calculated from trusted area and configured rate', () => {
  assert.equal(calculateMuralTotal(150, 150), 22_500);
});

test('purchase policy refuses sold paintings and concurrent placed orders', () => {
  assert.equal(canPurchasePainting('available', false), true);
  assert.equal(canPurchasePainting('sold', false), false);
  assert.equal(canPurchasePainting('available', true), false);
});
