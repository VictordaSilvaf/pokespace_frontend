import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'
import { saveActiveCharacterId } from '../active-character'
import type { Character } from '../schemas'

export const CHARACTER_SLOT_COUNT = 4
export const EMPTY_CHARACTER_IMAGE = '/assets/ui/skins/None.png'

const slotShellClassName =
  'animate-rise-in flex aspect-square flex-col overflow-hidden rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] transition-[transform,border-color,background-color] duration-160 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-[rgba(22,22,31,0.95)]'

type CharacterSlotProps = {
  character: Character
}

export function CharacterSlot({ character }: CharacterSlotProps) {
  return (
    <Link
      to="/game"
      className={cn(slotShellClassName, 'text-inherit no-underline')}
      title={m.character_enter_world()}
      onClick={() => saveActiveCharacterId(character.id)}
    >
      <div className="relative min-h-0 flex-1 bg-[#0c0c13]">
        <img
          src={character.skinImageUrl}
          alt={character.skinName}
          className="absolute inset-0 size-full object-cover object-top [image-rendering:pixelated]"
        />
      </div>
      <div className="shrink-0 border-t border-line px-3 py-2.5 text-center">
        <h2 className="m-0 truncate text-sm font-extrabold tracking-[-0.02em]">
          {character.displayName}
        </h2>
        <p className="mt-0.5 mb-0 truncate text-[0.75rem] text-ink-soft">
          {m.character_slot_world({ world: character.worldName })}
        </p>
        <p className="mt-1 mb-0 text-[0.7rem] font-bold tracking-wide text-gold uppercase">
          {m.character_enter_world()}
        </p>
      </div>
    </Link>
  )
}

type CharacterSlotEmptyProps = {
  canCreate?: boolean
}

export function CharacterSlotEmpty({
  canCreate = true,
}: CharacterSlotEmptyProps) {
  const content = (
    <>
      <div className="relative min-h-0 flex-1 bg-[#0c0c13]">
        <img
          src={EMPTY_CHARACTER_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-80"
        />
      </div>
      <div className="shrink-0 border-t border-line px-3 py-2.5 text-center">
        <h2 className="m-0 truncate text-sm font-extrabold tracking-[-0.02em] text-ink-soft">
          {m.character_slot_empty()}
        </h2>
        <p className="mt-0.5 mb-0 truncate text-[0.75rem] text-mute">
          {canCreate ? m.character_create_cta() : m.character_slot_locked()}
        </p>
      </div>
    </>
  )

  if (canCreate) {
    return (
      <Link
        to="/characters/create"
        className={cn(slotShellClassName, 'text-inherit no-underline')}
      >
        {content}
      </Link>
    )
  }

  return (
    <article
      className={cn(
        slotShellClassName,
        'opacity-70 hover:translate-y-0 hover:border-line hover:bg-[rgba(16,16,24,0.88)]',
      )}
    >
      {content}
    </article>
  )
}
