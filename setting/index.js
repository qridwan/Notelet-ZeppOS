import { gettext } from 'i18n'

// The watch is read-only in MVP (SRS #42): all note/folder management happens
// on the mobile app, so this settings page is informational only.
AppSettingsPage({
  build() {
    return View(
      {
        style: {
          padding: '16px 20px'
        }
      },
      [
        View(
          {
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }
          },
          [gettext('aboutTitle')]
        ),
        View(
          {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          },
          [gettext('aboutBody')]
        )
      ]
    )
  }
})
