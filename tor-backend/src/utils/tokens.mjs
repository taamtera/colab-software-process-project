import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { authConfig } from '../config/env.mjs';

// Token helpers used across authentication:
// - Access token: a compact HMAC-SHA256 JWT (HS256) so protected routes need no DB
//   lookup. Payload carries { sub, companyId, role, iat, exp }.
// - Refresh / one-time tokens: opaque random values. Only their sha256 hash is stored
//   (sessions.refreshTokenHash, auth_tokens.tokenHash); the raw value lives in a cookie
//   or an emailed link and never touches the database.

export function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function generateRawToken(byteLength = 32) {
  return randomBytes(byteLength).toString('hex');
}

function base64urlJson(object) {
  return Buffer.from(JSON.stringify(object)).toString('base64url');
}

export function signAccessToken(claims, ttlSeconds = authConfig.accessTtlSeconds) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const payload = base64urlJson({ ...claims, iat: issuedAt, exp: issuedAt + ttlSeconds });
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', authConfig.accessSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyAccessToken(token) {
  if (typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expected = createHmac('sha256', authConfig.accessSecret).update(data).digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let claims;

  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof claims.exp !== 'number' || claims.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return claims;
}
