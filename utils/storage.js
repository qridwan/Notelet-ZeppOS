import { statSync, writeFileSync as writeFile, readFileSync as readFile } from '@zos/fs'

/**
 * Generic JSON file storage for watch-local data (folders, notes).
 * Mobile is the source of truth; this only persists the synced copy (SRS #39, #41).
 */
export function readJsonFile(path, fallback) {
  const fStat = statSync({ path })
  if (!fStat) {
    return fallback
  }
  const raw = readFile({ path, options: { encoding: 'utf8' } })
  if (!raw) {
    return fallback
  }
  try {
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function writeJsonFile(path, data) {
  writeFile({
    path,
    data: JSON.stringify(data),
    options: { encoding: 'utf8' }
  })
}
