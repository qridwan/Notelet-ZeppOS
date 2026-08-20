import * as hmUI from '@zos/ui'
import hmApp from '@zos/app'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  TITLE_TEXT_STYLE,
  TIPS_TEXT_STYLE,
  HOME_LIST
} from 'zosLoader:./index.page.[pf].layout.js'
import { getScrollListDataConfig } from './../../utils/index'

const logger = Logger.getLogger('notelet-home')

Page(
  BasePage({
    state: {
      title: null,
      tipText: null,
      list: null,
      items: []
    },
    onInit() {
      logger.debug('home onInit invoked')
    },
    build() {
      logger.debug('home build invoked')

      this.state.title = hmUI.createWidget(hmUI.widget.TEXT, {
        ...TITLE_TEXT_STYLE
      })

      this.loadFolders()
    },
    onDestroy() {
      logger.debug('home onDestroy invoked')
    },
    loadFolders() {
      this.request({ method: 'GET_FOLDERS' })
        .then(({ result }) => {
          const items = [
            { iconText: '⭐', label: 'Pinned', route: { type: 'pinned' } },
            ...result.map((folder) => ({
              iconText: '📁',
              label: folder.name,
              route: { type: 'folder', folderId: folder.id, folderName: folder.name }
            })),
            { iconText: '🔍', label: 'Search', route: { type: 'search' } }
          ]
          this.state.items = items
          this.renderList()
        })
        .catch(() => {
          this.renderList()
        })
    },
    renderList() {
      const { items, list } = this.state

      if (items.length === 0) {
        !this.state.tipText &&
          (this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, { ...TIPS_TEXT_STYLE }))
        return
      }

      const dataTypeConfig = getScrollListDataConfig(-1, items.length)

      if (list) {
        list.setProperty(hmUI.prop.UPDATE_DATA, {
          data_array: items,
          data_count: items.length,
          data_type_config: [{ start: 0, end: items.length, type_id: 1 }],
          data_type_config_count: 1,
          on_page: 1
        })
      } else {
        this.state.list = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
          ...HOME_LIST,
          data_array: items,
          data_count: items.length,
          data_type_config: dataTypeConfig,
          data_type_config_count: dataTypeConfig.length,
          on_page: 1,
          item_click_func: (list, index) => this.onItemClick(index)
        })
      }
    },
    onItemClick(index) {
      const item = this.state.items[index]
      if (!item) return

      if (item.route.type === 'pinned') {
        hmApp.gotoPage({
          url: 'page/folder/index.page',
          param: JSON.stringify({ folderId: '__pinned__', folderName: 'Pinned' })
        })
      } else if (item.route.type === 'folder') {
        hmApp.gotoPage({
          url: 'page/folder/index.page',
          param: JSON.stringify({
            folderId: item.route.folderId,
            folderName: item.route.folderName
          })
        })
      } else if (item.route.type === 'search') {
        // Basic title search is a Phase 1 stretch goal (SRS #23); not part of the mock UI yet.
        hmUI.showToast({ text: 'Search coming soon' })
      }
    }
  })
)
