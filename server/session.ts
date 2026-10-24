import { createHash, randomBytes } from 'node:crypto';

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function sessionExpiry(now = Date.now(), hours = 8) {
  return new Date(now + hours * 60 * 60 * 1000);
}

export function isSessionExpired(expiresAt: Date, now = Date.now()) {
  return expiresAt.getTime() <= now;
}
