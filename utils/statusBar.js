import * as hmUI from '@zos/ui'

/**
 * Square devices draw a system status bar (the app name) over the top of the
 * page, which covered every page's own title. Each page hides it in build()
 * and again in onResume() — returning from a pushed page can bring it back.
 * The API only exists on square devices, so it's a no-op on round ones.
 */
export function hideStatusBar() {
  if (typeof hmUI.setStatusBarVisible === 'function') {
    hmUI.setStatusBarVisible(false)
  }
}
