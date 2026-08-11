import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;

function base32Encode(buffer: Buffer): string {
  let bits = "";
  let encoded = "";

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5);
    const value = parseInt(chunk.padEnd(5, "0"), 2);
    encoded += BASE32_ALPHABET[value];
  }

  return encoded;
}

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";

  for (const char of cleaned) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(bytes = 20): string {
  const random = crypto.randomBytes(bytes);
  return base32Encode(random);
}

export function generateTotp(secret: string, timestamp: number = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / TOTP_STEP_SECONDS);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];

  const otp = (bin % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, "0");
  return otp;
}

export function verifyTotp(secret: string, code: string, timestamp: number = Date.now()): boolean {
  const normalized = code.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) {
    return false;
  }

  // Accept codes within a +/-1 step window to tolerate clock drift
  for (const window of [-1, 0, 1]) {
    const candidate = generateTotp(secret, timestamp + window * TOTP_STEP_SECONDS * 1000);
    if (candidate === normalized) {
      return true;
    }
  }

  return false;
}

export function buildOtpauthUrl(secret: string, email: string, issuer = "Agent Builder"): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    period: String(TOTP_STEP_SECONDS),
    digits: String(TOTP_DIGITS),
    algorithm: "SHA1",
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params.toString()}`;
}
