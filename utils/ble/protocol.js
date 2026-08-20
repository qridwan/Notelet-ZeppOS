/**
 * Phase 0 communication POC (SRS §9, §62): a custom BLE GATT protocol so the
 * watch (as BLE Central, via @zos/ble) can talk directly to the Notelet
 * mobile app (as a BLE Peripheral), bypassing the Zepp app entirely — there
 * is no documented channel from a third-party mobile app to a Zepp OS
 * mini-program's Side Service (confirmed against docs.zepp.com; the only
 * sanctioned Side Service channels are Device App via Bluetooth, Settings
 * App via shared settingsStorage, and a remote server via fetch).
 *
 * UNTESTED: this has not run against real Bluetooth hardware. It's built
 * against the documented @zos/ble API surface (mstStartScan/mstConnect/
 * mstBuildProfile/mstReadCharacteristic/mstWriteCharacteristic, all v3.0+),
 * but real BLE stacks vary in negotiated MTU, timing, and long-read
 * behavior — expect to tune CHUNK_SIZE and add retry/timeout handling once
 * this runs against a real mobile-side peripheral.
 *
 * This file must be kept in sync with mobile/src/services/sync/ble/protocol.ts.
 */

// Custom 128-bit UUIDs (not a registered SIG UUID — arbitrary but fixed so
// watch and phone agree on what to scan/advertise for).
export const NOTELET_SERVICE_UUID = '7e4e1000-9a3c-4f1e-8f0a-6c3d8f2b9a01'
export const CONTROL_CHARACTERISTIC_UUID = '7e4e1001-9a3c-4f1e-8f0a-6c3d8f2b9a01'
export const DATA_CHARACTERISTIC_UUID = '7e4e1002-9a3c-4f1e-8f0a-6c3d8f2b9a01'

// Conservative default: BLE's default ATT MTU (23 bytes) leaves ~20 usable
// bytes; most modern stacks negotiate higher, but this is unverified against
// real hardware, so it starts small on purpose. Tune upward once a real MTU
// negotiation is observed.
export const CHUNK_PAYLOAD_SIZE = 100

// Control-characteristic commands the watch writes to the phone.
export const BleCommand = {
  REQUEST_CHUNK: 'REQUEST_CHUNK',
  ACK_SYNC_COMPLETE: 'ACK_SYNC_COMPLETE'
}

// --- UTF-8 + base64 codec -------------------------------------------------
// GATT characteristic values are raw bytes; base64-encoding the JSON payload
// keeps every chunk plain ASCII, which sidesteps relying on TextEncoder
// (not guaranteed to exist in this JS engine) for anything beyond the
// manual UTF-8 step below.

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function utf8Encode(str) {
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    let code = str.codePointAt(i)
    if (code > 0xffff) i++ // consumed a surrogate pair
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      )
    }
  }
  return bytes
}

function utf8Decode(bytes) {
  let str = ''
  let i = 0
  while (i < bytes.length) {
    const b0 = bytes[i]
    if (b0 < 0x80) {
      str += String.fromCodePoint(b0)
      i += 1
    } else if ((b0 & 0xe0) === 0xc0) {
      str += String.fromCodePoint(((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f))
      i += 2
    } else if ((b0 & 0xf0) === 0xe0) {
      str += String.fromCodePoint(
        ((b0 & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)
      )
      i += 3
    } else {
      str += String.fromCodePoint(
        ((b0 & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f)
      )
      i += 4
    }
  }
  return str
}

function bytesToBase64(bytes) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined

    out += BASE64_ALPHABET[b0 >> 2]
    out += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)]
    out += b1 === undefined ? '=' : BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)]
    out += b2 === undefined ? '=' : BASE64_ALPHABET[b2 & 0x3f]
  }
  return out
}

function base64ToBytes(base64) {
  const clean = base64.replace(/=+$/, '')
  const bytes = []
  let buffer = 0
  let bits = 0
  for (let i = 0; i < clean.length; i++) {
    const value = BASE64_ALPHABET.indexOf(clean[i])
    if (value === -1) continue
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
    }
  }
  return bytes
}

export function encodeMessageToBase64(message) {
  return bytesToBase64(utf8Encode(JSON.stringify(message)))
}

export function decodeBase64ToMessage(base64) {
  return JSON.parse(utf8Decode(base64ToBytes(base64)))
}

// --- Chunking --------------------------------------------------------------

export function splitIntoChunks(base64String) {
  const chunks = []
  for (let i = 0; i < base64String.length; i += CHUNK_PAYLOAD_SIZE) {
    chunks.push(base64String.slice(i, i + CHUNK_PAYLOAD_SIZE))
  }
  return chunks.length > 0 ? chunks : ['']
}

export function joinChunks(chunks) {
  return chunks.join('')
}
