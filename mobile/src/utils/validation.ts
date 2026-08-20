export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function requireNonEmpty(value: string, fieldName: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} cannot exceed ${maxLength} characters`);
  }
  return trimmed;
}
