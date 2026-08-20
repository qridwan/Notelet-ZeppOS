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

export function getScrollListDataConfig(activeIndex, length) {
  const dataTypeConfig = []
  if (activeIndex === -1) {
    dataTypeConfig.push({
      start: 0,
      end: length,
      type_id: 2
    })
  } else if (activeIndex === 0) {
    dataTypeConfig.push({
      start: 0,
      end: activeIndex,
      type_id: 1
    })
    dataTypeConfig.push({
      start: activeIndex + 1,
      end: length,
      type_id: 2
    })
  } else {
    dataTypeConfig.push({
      start: 0,
      end: activeIndex - 1,
      type_id: 2
    })
    dataTypeConfig.push({
      start: activeIndex,
      end: activeIndex,
      type_id: 1
    })
    dataTypeConfig.push({
      start: activeIndex + 1,
      end: length,
      type_id: 2
    })
  }
  return dataTypeConfig
}
