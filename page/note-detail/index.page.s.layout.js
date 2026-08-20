import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

export const CONTENT_X = px(24)
export const CONTENT_W = DEVICE_WIDTH - px(48)

export const SCROLL_CONTAINER = {
  x: px(0),
  y: px(0),
  w: DEVICE_WIDTH,
  h: DEVICE_HEIGHT
}

export const TITLE_TEXT_STYLE = {
  x: CONTENT_X,
  y: px(24),
  w: CONTENT_W,
  h: px(64),
  color: 0xffffff,
  text_size: px(30),
  align_h: hmUI.align.LEFT,
  text_style: hmUI.text_style.WRAP
}

export const DESCRIPTION_TEXT_STYLE = {
  x: CONTENT_X,
  y: px(96),
  w: CONTENT_W,
  color: 0xcccccc,
  text_size: px(24),
  align_h: hmUI.align.LEFT,
  text_style: hmUI.text_style.WRAP
}

export const NOT_FOUND_TEXT_STYLE = {
  x: px(20),
  y: px(0),
  w: DEVICE_WIDTH - px(40),
  h: DEVICE_HEIGHT,
  color: 0xaaaaaa,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}
