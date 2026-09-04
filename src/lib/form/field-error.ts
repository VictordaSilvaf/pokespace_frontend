export function fieldError(errors: Array<unknown>): string | undefined {
  const first = errors[0]
  if (first == null) {
    return undefined
  }
  if (typeof first === 'string') {
    return first
  }
  if (typeof first === 'object' && 'message' in first) {
    return String(first.message)
  }
  return String(first)
}
