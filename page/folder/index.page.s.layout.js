import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { SQUARE_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #27: square (Bip Max) uses a tighter margin than round, plus its
// extra vertical space for a taller list.
const MARGIN = safeMargin(DEVICE_WIDTH, SQUARE_MARGIN_RATIO)
const LIST_W = DEVICE_WIDTH - MARGIN * 2
const PIN_W = px(44)
const TEXT_X = px(16)
const TEXT_W = LIST_W - TEXT_X - PIN_W - px(8)

export const TITLE_TEXT_STYLE = {
  x: MARGIN,
  y: px(20),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: px(50),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.ELLIPSIS
}

export const TIPS_TEXT_STYLE = {
  x: MARGIN,
  y: px(100),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: DEVICE_HEIGHT - px(160),
  color: 0xaaaaaa,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}

export const NOTE_LIST = {
  item_height: px(104),
  item_space: px(8),
  item_config: [
    {
      type_id: 1,
      item_bg_color: 0x222222,
      item_bg_radius: px(16),
      text_view: [
        {
          x: TEXT_X,
          y: px(8),
          w: TEXT_W,
          h: px(38),
          key: 'title',
          color: 0xffffff,
          text_size: px(28),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: TEXT_X,
          y: px(52),
          w: TEXT_W,
          h: px(38),
          key: 'preview',
          color: 0x999999,
          text_size: px(20),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: LIST_W - PIN_W - px(4),
          y: px(0),
          w: PIN_W,
          h: px(104),
          key: 'pinMark',
          color: 0xffcc00,
          text_size: px(28),
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V
        }
      ],
      text_view_count: 3
    }
  ],
  item_config_count: 1,
  x: MARGIN,
  y: px(76),
  h: DEVICE_HEIGHT - px(92),
  w: LIST_W
}
