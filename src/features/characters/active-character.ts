const ACTIVE_CHARACTER_KEY = 'pokespace.activeCharacterId'

export function loadActiveCharacterId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACTIVE_CHARACTER_KEY)
  } catch {
    return null
  }
}

export function saveActiveCharacterId(characterId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACTIVE_CHARACTER_KEY, characterId)
}

export function clearActiveCharacterId(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACTIVE_CHARACTER_KEY)
}
