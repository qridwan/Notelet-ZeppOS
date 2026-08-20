import * as hmUI from '@zos/ui'
import { getText } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { ROUND_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #26: round-display safe area — keeps list rows and text away from the
// bezel corners where a rectangular layout would otherwise get clipped.
const MARGIN = safeMargin(DEVICE_WIDTH, ROUND_MARGIN_RATIO)
const LIST_W = DEVICE_WIDTH - MARGIN * 2

export const TITLE_TEXT_STYLE = {
  text: getText('appName'),
  x: px(0),
  y: px(56),
  w: DEVICE_WIDTH,
  h: px(50),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.NONE
}

export const TIPS_TEXT_STYLE = {
  text: getText('noFolders'),
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
// widget layered on top of a BUTTON also silently blocks its taps (verified),
// so each row is a single BUTTON with the icon+label combined into its own
// text — the only combination confirmed to both render and stay tappable.
export const ROW_X = MARGIN
export const ROW_Y = px(120)
export const ROW_W = LIST_W
export const ROW_H = px(96)
export const ROW_SPACE = px(8)

export const ROW_BUTTON_STYLE = {
  normal_color: 0x222222,
  press_color: 0x333333,
  radius: px(20),
  color: 0xffffff,
  text_size: px(30)
}
