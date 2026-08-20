/**
 * Phase 0 communication POC (SRS §9, §62): must stay byte-for-byte in sync
 * with the watch-side copy at utils/ble/protocol.js (project root). See
 * that file for the full rationale — no documented channel exists between a
 * third-party mobile app and a Zepp OS mini-program's Side Service, so the
 * watch's @zos/ble Central connects directly to this app acting as a BLE
 * Peripheral, bypassing the Zepp app entirely.
 *
 * UNTESTED against real Bluetooth hardware. Uses the same manual UTF-8 +
 * base64 codec as the watch side rather than relying on `btoa`/`atob` —
 * those are DOM globals, not guaranteed to exist under Hermes/JSC.
 */

export const NOTELET_SERVICE_UUID = '7e4e1000-9a3c-4f1e-8f0a-6c3d8f2b9a01';
export const CONTROL_CHARACTERISTIC_UUID = '7e4e1001-9a3c-4f1e-8f0a-6c3d8f2b9a01';
export const DATA_CHARACTERISTIC_UUID = '7e4e1002-9a3c-4f1e-8f0a-6c3d8f2b9a01';

// Must match utils/ble/protocol.js's CHUNK_PAYLOAD_SIZE — a real MTU
// negotiation on hardware will likely allow raising this.
export const CHUNK_PAYLOAD_SIZE = 100;

export const BleCommand = {
  REQUEST_CHUNK: 'REQUEST_CHUNK',
  ACK_SYNC_COMPLETE: 'ACK_SYNC_COMPLETE',
} as const;

export const END_OF_STREAM_MARKER = '__END__';

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function utf8Encode(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.codePointAt(i) as number;
    if (code > 0xffff) i++; // consumed a surrogate pair
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function utf8Decode(bytes: number[]): string {
  let str = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 < 0x80) {
      str += String.fromCodePoint(b0);
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      str += String.fromCodePoint(((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      str += String.fromCodePoint(
        ((b0 & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else {
      str += String.fromCodePoint(
        ((b0 & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f),
      );
      i += 4;
    }
  }
  return str;
}

function bytesToBase64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

    out += BASE64_ALPHABET[b0 >> 2];
    out += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out +=
      b1 === undefined ? '=' : BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? '=' : BASE64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

function base64ToBytes(base64: string): number[] {
  const clean = base64.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const value = BASE64_ALPHABET.indexOf(clean[i]);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

export function encodeMessageToBase64(message: unknown): string {
  return bytesToBase64(utf8Encode(JSON.stringify(message)));
}

export function decodeBase64ToMessage<T = unknown>(base64: string): T {
  return JSON.parse(utf8Decode(base64ToBytes(base64))) as T;
}

export function splitIntoChunks(base64String: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < base64String.length; i += CHUNK_PAYLOAD_SIZE) {
    chunks.push(base64String.slice(i, i + CHUNK_PAYLOAD_SIZE));
  }
  return chunks.length > 0 ? chunks : [''];
}

export function joinChunks(chunks: string[]): string {
  return chunks.join('');
}
