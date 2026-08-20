import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { ROUND_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #26: round-display safe area, shared with the home/folder layouts.
const MARGIN = safeMargin(DEVICE_WIDTH, ROUND_MARGIN_RATIO)
export const CONTENT_X = MARGIN
export const CONTENT_W = DEVICE_WIDTH - MARGIN * 2

export const SCROLL_CONTAINER = {
  x: px(0),
  y: px(0),
  w: DEVICE_WIDTH,
  h: DEVICE_HEIGHT
}

export const TITLE_TEXT_STYLE = {
  x: CONTENT_X,
  y: px(60),
  w: CONTENT_W,
  h: px(70),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.LEFT,
  text_style: hmUI.text_style.WRAP
}

// SCROLL_LIST does not render in the current environment, so long notes are
// paginated instead of scrolled: NAV_Y reserves room at the bottom for
// prev/next controls and a page indicator.
export const NAV_Y = DEVICE_HEIGHT - px(70)

// Reading controls (font size +/-, keep-awake toggle) sit in their own row
// between the title and the description, so DESCRIPTION_TEXT_STYLE starts
// below them rather than at a fixed offset from the title.
export const CONTROL_Y = px(135)
export const CONTROL_H = px(52)
const CONTROL_GAP = px(8)
const CONTROL_BTN_W = Math.floor((CONTENT_W - CONTROL_GAP * 2) / 3)

const controlButtonBase = {
  y: CONTROL_Y,
  h: CONTROL_H,
  radius: px(14),
  text_size: px(24),
  normal_color: 0x222222,
  press_color: 0x333333,
  color: 0xffffff
}

export const FONT_DEC_BUTTON_STYLE = {
  ...controlButtonBase,
  x: CONTENT_X,
  w: CONTROL_BTN_W,
  text: 'A−'
}

export const FONT_INC_BUTTON_STYLE = {
  ...controlButtonBase,
  x: CONTENT_X + CONTROL_BTN_W + CONTROL_GAP,
  w: CONTROL_BTN_W,
  text: 'A+'
}

export const KEEP_AWAKE_BUTTON_STYLE = {
  ...controlButtonBase,
  x: CONTENT_X + (CONTROL_BTN_W + CONTROL_GAP) * 2,
  w: CONTROL_BTN_W,
  text_size: px(20)
}

export const DESCRIPTION_BASE_FONT_SIZE = px(26)
export const FONT_SIZE_STEP = px(4)
export const FONT_SIZE_MIN = px(18)
export const FONT_SIZE_MAX = px(38)

const DESCRIPTION_Y = CONTROL_Y + CONTROL_H + px(10)

export const DESCRIPTION_TEXT_STYLE = {
  x: CONTENT_X,
  y: DESCRIPTION_Y,
  w: CONTENT_W,
  h: NAV_Y - DESCRIPTION_Y - px(10),
  color: 0xcccccc,
  text_size: DESCRIPTION_BASE_FONT_SIZE,
  align_h: hmUI.align.LEFT,
  text_style: hmUI.text_style.WRAP
}

export const PAGE_INDICATOR_STYLE = {
  x: px(0),
  y: NAV_Y,
  w: DEVICE_WIDTH,
  h: px(50),
  color: 0x888888,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V
}

export const PREV_BUTTON_STYLE = {
  x: CONTENT_X,
  y: NAV_Y,
  w: px(90),
  h: px(56),
  radius: px(16),
  text: '‹ Prev',
  text_size: px(24),
  normal_color: 0x222222,
  press_color: 0x333333,
  color: 0xffffff
}

export const NEXT_BUTTON_STYLE = {
  x: DEVICE_WIDTH - CONTENT_X - px(90),
  y: NAV_Y,
  w: px(90),
  h: px(56),
  radius: px(16),
  text: 'Next ›',
  text_size: px(24),
  normal_color: 0x222222,
  press_color: 0x333333,
  color: 0xffffff
}

export const NOT_FOUND_TEXT_STYLE = {
  x: MARGIN,
  y: px(0),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: DEVICE_HEIGHT,
  color: 0xaaaaaa,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}
