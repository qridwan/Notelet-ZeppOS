import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

export const TITLE_TEXT_STYLE = {
  x: px(0),
  y: px(20),
  w: DEVICE_WIDTH,
  h: px(50),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.ELLIPSIS
}

export const TIPS_TEXT_STYLE = {
  x: px(20),
  y: px(100),
  w: DEVICE_WIDTH - px(40),
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
          x: px(16),
          y: px(8),
          w: DEVICE_WIDTH - px(110),
          h: px(38),
          key: 'title',
          color: 0xffffff,
          text_size: px(28),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: px(16),
          y: px(52),
          w: DEVICE_WIDTH - px(110),
          h: px(38),
          key: 'preview',
          color: 0x999999,
          text_size: px(20),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: DEVICE_WIDTH - px(90),
          y: px(0),
          w: px(50),
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
  x: px(20),
  y: px(76),
  h: DEVICE_HEIGHT - px(90),
  w: DEVICE_WIDTH - px(40)
}
