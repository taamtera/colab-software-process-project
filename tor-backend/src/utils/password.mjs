import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Password hashing with Node's built-in scrypt (no native dependency).
// Stored format: `scrypt$<N>$<saltHex>$<hashHex>` — self-describing so parameters
// can evolve without breaking existing hashes. Satisfies NFR7 (no plaintext passwords).

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const COST = 16384; // scrypt N (CPU/memory cost)
const BLOCK_SIZE = 8; // r
const PARALLELIZATION = 1; // p
// scrypt memory use is roughly 128 * N * r bytes; raise maxmem so N=16384 is allowed.
const MAX_MEM = 64 * 1024 * 1024;

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string.');
  }

  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEM
  });

  return `scrypt$${COST}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') {
    return false;
  }

  const parts = stored.split('$');

  if (parts.length !== 4 || parts[0] !== 'scrypt') {
    return false;
  }

  const cost = Number.parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], 'hex');
  const expected = Buffer.from(parts[3], 'hex');

  if (!Number.isInteger(cost) || salt.length === 0 || expected.length === 0) {
    return false;
  }

  const derived = await scryptAsync(password, salt, expected.length, {
    N: cost,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEM
  });

  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
