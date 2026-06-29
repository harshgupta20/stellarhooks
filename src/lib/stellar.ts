/**
 * Lightweight Stellar StrKey validation (no SDK dependency).
 *
 * An account public key ("G..." address) is a base32-encoded payload of:
 *   [ version byte (0x30) ][ 32-byte ed25519 public key ][ 2-byte CRC16 ]
 * where the checksum is CRC16-XModem over the version byte + key, little-endian.
 */

const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ACCOUNT_VERSION_BYTE = 6 << 3; // 0x30 → encodes to a leading "G"

function base32Decode(input: string): Uint8Array | null {
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of input) {
    const idx = RFC4648_ALPHABET.indexOf(char);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }
  return Uint8Array.from(output);
}

function crc16xmodem(bytes: Uint8Array): number {
  let crc = 0x0000;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

/** Returns true if `address` is a valid Stellar account public key (G...). */
export function isValidStellarPublicKey(address: string): boolean {
  if (!/^G[A-Z2-7]{55}$/.test(address)) return false;

  const decoded = base32Decode(address);
  if (!decoded || decoded.length !== 35) return false;

  if (decoded[0] !== ACCOUNT_VERSION_BYTE) return false;

  const payload = decoded.subarray(0, 33);
  const checksum = decoded[33] | (decoded[34] << 8); // little-endian
  return crc16xmodem(payload) === checksum;
}

/** Shorten an address for display: GABC…WXYZ. */
export function truncateAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function isNativeAsset(assetCode: string): boolean {
  return assetCode.toUpperCase() === "XLM";
}

/**
 * Build a SEP-0007 `web+stellar:pay` URI suitable for a QR code. Wallets that
 * support SEP-7 will prefill the destination, amount, asset, and memo.
 */
export function buildStellarPaymentUri(params: {
  destination: string;
  assetCode: string;
  assetIssuer?: string | null;
  amount?: string | null;
  memo?: string | null;
}): string {
  const query = new URLSearchParams({ destination: params.destination });
  if (params.amount) query.set("amount", params.amount);
  if (!isNativeAsset(params.assetCode)) {
    query.set("asset_code", params.assetCode);
    if (params.assetIssuer) query.set("asset_issuer", params.assetIssuer);
  }
  if (params.memo) {
    query.set("memo", params.memo);
    query.set("memo_type", "MEMO_TEXT");
  }
  return `web+stellar:pay?${query.toString()}`;
}
