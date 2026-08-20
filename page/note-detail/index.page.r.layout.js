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

export const DESCRIPTION_TEXT_STYLE = {
  x: CONTENT_X,
  y: px(140),
  w: CONTENT_W,
  color: 0xcccccc,
  text_size: px(26),
  align_h: hmUI.align.LEFT,
  text_style: hmUI.text_style.WRAP
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
