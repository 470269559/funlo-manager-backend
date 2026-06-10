import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split('$');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return false;
  }

  const inputHash = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (inputHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputHash, storedHashBuffer);
}
