import { Link } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import type { Character } from '../schemas'

type CharacterSlotProps = {
  character: Character
}

export function CharacterSlot({ character }: CharacterSlotProps) {
  return (
    <article className="feature-card rise-in rounded-2xl border border-[var(--line)] p-4">
      <div className="flex items-center gap-4">
        <img
          src={character.skinImageUrl}
          alt={character.skinName}
          className="size-16 rounded-xl border border-[var(--line)] bg-[var(--foam)] object-cover"
        />
        <div className="min-w-0">
          <h2 className="display-title truncate text-xl text-[var(--sea-ink)]">
            {character.displayName}
          </h2>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {m.character_slot_world({ world: character.worldName })}
          </p>
        </div>
      </div>
    </article>
  )
}

export function CharacterCreateCta({ disabled }: { disabled?: boolean }) {
  if (disabled) return null

  return (
    <Link
      to="/characters/create"
      className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--lagoon-deep)] px-5 text-sm font-semibold text-white no-underline transition hover:bg-[var(--lagoon)]"
    >
      {m.character_create_cta()}
    </Link>
  )
}
