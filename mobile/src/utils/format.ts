export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function formatUpdatedAt(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
