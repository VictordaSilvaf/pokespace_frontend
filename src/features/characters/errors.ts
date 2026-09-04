import { m } from '#/paraglide/messages'

export function characterCreateErrorMessage(code: string): string {
  switch (code) {
    case 'duplicate_name':
    case 'conflict':
      return m.character_error_duplicate()
    case 'limit_reached':
      return m.character_error_limit()
    case 'rate_limit':
      return m.character_error_rate_limit()
    case 'validation':
      return m.character_error_validation()
    default:
      return m.character_error_generic()
  }
}
