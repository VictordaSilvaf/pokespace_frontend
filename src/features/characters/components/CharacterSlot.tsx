import { Link } from '@tanstack/react-router'

import { m } from '#/paraglide/messages'
import type { Character } from '../schemas'

type CharacterSlotProps = {
  character: Character
}

export function CharacterSlot({ character }: CharacterSlotProps) {
  return (
    <article className="character-slot rise-in">
      <img
        src={character.skinImageUrl}
        alt={character.skinName}
      />
      <div className="min-w-0">
        <h2 className="truncate">{character.displayName}</h2>
        <p>{m.character_slot_world({ world: character.worldName })}</p>
      </div>
    </article>
  )
}

export function CharacterCreateCta({ disabled }: { disabled?: boolean }) {
  if (disabled) return null

  return (
    <Link to="/characters/create" className="btn btn-gold">
      {m.character_create_cta()}
    </Link>
  )
}
