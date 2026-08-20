export function truncate(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text
}

export function formatTime(timestampMs) {
  const date = new Date(timestampMs)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
