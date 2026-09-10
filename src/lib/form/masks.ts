/** Strip everything except digits. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Brazilian phone: (11) 9999-9999 or (11) 99999-9999.
 * Accepts pasted +55 / 55 country code and normalizes to DDD + number.
 */
export function maskPhoneBr(value: string): string {
  let digits = digitsOnly(value)

  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2)
  }

  digits = digits.slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** 6-digit OTP / 2FA / phone verification code. */
export function maskOtp(value: string, length = 6): string {
  return digitsOnly(value).slice(0, length)
}

/** Trainer username: lowercase a-z, 0-9, underscore. */
export function maskUsername(value: string, max = 20): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, max)
}

/** Character display name: letters, digits, underscore (keeps case). */
export function maskDisplayName(value: string, max = 16): string {
  return value.replace(/\W/g, '').slice(0, max)
}

export type FieldMask = 'phone' | 'otp' | 'username' | 'displayName'

export function applyMask(mask: FieldMask, value: string): string {
  switch (mask) {
    case 'phone':
      return maskPhoneBr(value)
    case 'otp':
      return maskOtp(value)
    case 'username':
      return maskUsername(value)
    case 'displayName':
      return maskDisplayName(value)
  }
}
