import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { ROUND_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #26: round-display safe area.
const MARGIN = safeMargin(DEVICE_WIDTH, ROUND_MARGIN_RATIO)
const LIST_W = DEVICE_WIDTH - MARGIN * 2
const PIN_W = px(50)
const TEXT_X = px(20)
const TEXT_W = LIST_W - TEXT_X - PIN_W - px(10)

export const TITLE_TEXT_STYLE = {
  x: MARGIN,
  y: px(50),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: px(50),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.ELLIPSIS
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

export const NOTE_LIST = {
  item_height: px(110),
  item_space: px(10),
  item_config: [
    {
      type_id: 1,
      item_bg_color: 0x222222,
      item_bg_radius: px(20),
      text_view: [
        {
          x: TEXT_X,
          y: px(10),
          w: TEXT_W,
          h: px(40),
          key: 'title',
          color: 0xffffff,
          text_size: px(30),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: TEXT_X,
          y: px(56),
          w: TEXT_W,
          h: px(40),
          key: 'preview',
          color: 0x999999,
          text_size: px(22),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: LIST_W - PIN_W - px(4),
          y: px(0),
          w: PIN_W,
          h: px(110),
          key: 'pinMark',
          color: 0xffcc00,
          text_size: px(30),
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V
        }
      ],
      text_view_count: 3
    }
  ],
  item_config_count: 1,
  x: MARGIN,
  y: px(110),
  h: DEVICE_HEIGHT - px(130),
  w: LIST_W
}
