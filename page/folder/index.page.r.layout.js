import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { ROUND_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #26: round-display safe area.
const MARGIN = safeMargin(DEVICE_WIDTH, ROUND_MARGIN_RATIO)
const LIST_W = DEVICE_WIDTH - MARGIN * 2

export const TITLE_TEXT_STYLE = {
  x: MARGIN,
  y: px(50),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: px(50),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.NONE
}

export const TIPS_TEXT_STYLE = {
  x: MARGIN,
  y: px(140),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: DEVICE_HEIGHT - px(200),
  color: 0xaaaaaa,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}

// SCROLL_LIST does not render in the current environment. A separate TEXT
// widget layered on top of a BUTTON also silently blocks its taps (verified
// on the home screen), so each row is a single BUTTON with title (+ pin
// mark) as its own text — the note preview is dropped from the row, since
// the full note is one tap away on the detail screen.
export const ROW_X = MARGIN
export const ROW_Y = px(110)
export const ROW_W = LIST_W
export const ROW_H = px(84)
export const ROW_SPACE = px(10)

export const ROW_BUTTON_STYLE = {
  normal_color: 0x222222,
  press_color: 0x333333,
  radius: px(20),
  color: 0xffffff,
  text_size: px(28)
}
