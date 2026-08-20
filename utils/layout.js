// SRS #25-27: round and square displays need different safe margins. Round
// screens (Balance 3 / Balance Ultra, 480x480) clip content near the bezel
// corners, so text/buttons need a wider margin than a square screen (Bip Max,
// 432x514), which can use nearly its full rectangle. These ratios are a
// design heuristic, not a measured device spec — tune them if a real device
// shows clipping or excess whitespace.
export const ROUND_MARGIN_RATIO = 0.14
export const SQUARE_MARGIN_RATIO = 0.05

export function safeMargin(deviceWidth, ratio) {
  return Math.round(deviceWidth * ratio)
}
