import { Link } from '@tanstack/react-router'

import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'
import type { Character } from '../schemas'

type CharacterSlotProps = {
  character: Character
}

export function CharacterSlot({ character }: CharacterSlotProps) {
  return (
    <article className="animate-rise-in flex items-center gap-3.5 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-4 transition-[transform,border-color,background-color] duration-160 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-[rgba(22,22,31,0.95)]">
      <img
        src={character.skinImageUrl}
        alt={character.skinName}
        className="size-14 shrink-0 rounded-xl border border-line bg-[#0c0c13] object-cover"
      />
      <div className="min-w-0">
        <h2 className="m-0 truncate text-[1.15rem] font-extrabold tracking-[-0.02em]">
          {character.displayName}
        </h2>
        <p className="mt-0.5 mb-0 text-[0.88rem] text-ink-soft">
          {m.character_slot_world({ world: character.worldName })}
        </p>
      </div>
    </article>
  )
}

export function CharacterCreateCta({ disabled }: { disabled?: boolean }) {
  if (disabled) return null

  return (
    <Link to="/characters/create" className={pillButton({ variant: 'gold' })}>
      {m.character_create_cta()}
    </Link>
  )
}
