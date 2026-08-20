import { readJsonFile, writeJsonFile } from './storage'

const PREFERENCES_FILE_NAME = 'notelet_reading_prefs.json'

const DEFAULT_PREFERENCES = {
  fontSizeStep: 0,
  keepAwake: false
}

// Reading preferences (font size, keep-awake) apply across all notes and
// persist locally — they're a device setting, not per-note data, so they
// live outside utils/syncStore.js and are never touched by sync.
export function getReadingPreferences() {
  return readJsonFile(PREFERENCES_FILE_NAME, DEFAULT_PREFERENCES)
}

export function setReadingPreferences(patch) {
  const next = { ...getReadingPreferences(), ...patch }
  writeJsonFile(PREFERENCES_FILE_NAME, next)
  return next
}
