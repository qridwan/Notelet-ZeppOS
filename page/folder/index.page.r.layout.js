import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { px } from '@zos/utils'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

export const TITLE_TEXT_STYLE = {
  x: px(0),
  y: px(50),
  w: DEVICE_WIDTH,
  h: px(50),
  color: 0xffffff,
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.ELLIPSIS
}

export const TIPS_TEXT_STYLE = {
  x: px(30),
  y: px(140),
  w: DEVICE_WIDTH - px(60),
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
          x: px(24),
          y: px(10),
          w: DEVICE_WIDTH - px(140),
          h: px(40),
          key: 'title',
          color: 0xffffff,
          text_size: px(30),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: px(24),
          y: px(56),
          w: DEVICE_WIDTH - px(140),
          h: px(40),
          key: 'preview',
          color: 0x999999,
          text_size: px(22),
          align_h: hmUI.align.LEFT,
          text_style: hmUI.text_style.ELLIPSIS
        },
        {
          x: DEVICE_WIDTH - px(110),
          y: px(0),
          w: px(60),
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
  x: px(40),
  y: px(110),
  h: DEVICE_HEIGHT - px(130),
  w: DEVICE_WIDTH - px(80)
}
