import * as hmUI from '@zos/ui'
import { getText } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'
import { SQUARE_MARGIN_RATIO, safeMargin } from './../../utils/layout'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

// SRS #27: square (Bip Max) has flat corners and extra vertical space
// (432x514) — a tighter margin and a slightly taller list use that space
// instead of mirroring the round display's wider safe area.
const MARGIN = safeMargin(DEVICE_WIDTH, SQUARE_MARGIN_RATIO)
const LIST_W = DEVICE_WIDTH - MARGIN * 2
const ICON_X = px(12)
const ICON_W = px(40)
const LABEL_X = ICON_X + ICON_W + px(8)

export const TITLE_TEXT_STYLE = {
  text: getText('appName'),
  x: px(0),
  y: px(24),
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
  y: px(100),
  w: DEVICE_WIDTH - MARGIN * 2,
  h: DEVICE_HEIGHT - px(160),
  color: 0xaaaaaa,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}

export const HOME_LIST = {
  item_height: px(94),
  item_space: px(8),
  item_config: [
    {
      type_id: 1,
      item_bg_color: 0x222222,
      item_bg_radius: px(16),
      text_view: [
        {
          x: LABEL_X,
          y: px(0),
          w: LIST_W - LABEL_X - px(12),
          h: px(94),
          key: 'label',
          color: 0xffffff,
          text_size: px(32),
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.CENTER_V
        },
        {
          x: ICON_X,
          y: px(0),
          w: ICON_W,
          h: px(94),
          key: 'iconText',
          color: 0xffcc00,
          text_size: px(34),
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.CENTER_V
        }
      ],
      text_view_count: 2
    }
  ],
  item_config_count: 1,
  x: MARGIN,
  y: px(76),
  h: DEVICE_HEIGHT - px(92),
  w: LIST_W
}
