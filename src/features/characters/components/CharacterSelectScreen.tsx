import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Skeleton } from '#/components/ui/skeleton'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

import { defaultLimits } from '../schemas'
import { CHARACTER_MAX_PER_ACCOUNT } from '../config'
import { charactersListQueryOptions } from '../queries'
import {
  CHARACTER_SLOT_COUNT,
  CharacterSlot,
  CharacterSlotEmpty,
} from './CharacterSlot'

export function CharacterSelectScreen() {
  const { data, isPending, isError, refetch, isFetching } = useQuery(
    charactersListQueryOptions(),
  )

  const characters = data?.characters ?? []
  const limits = data?.limits ?? defaultLimits(0, CHARACTER_MAX_PER_ACCOUNT)

  if (isPending) {
    return (
      <SelectShell>
        <p className="text-ink-soft">{m.character_loading()}</p>
        <SlotGrid>
          {Array.from({ length: CHARACTER_SLOT_COUNT }, (_, index) => (
            <Skeleton key={index} className="aspect-square rounded-[14px]" />
          ))}
        </SlotGrid>
      </SelectShell>
    )
  }

  return (
    <SelectShell>
      {isError ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="m-0 text-sm text-[#ff8d8d]">
            {m.character_load_error()}
          </p>
          <button
            type="button"
            className={pillButton({ variant: 'ghost', size: 'sm' })}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {m.character_next()}
          </button>
        </div>
      ) : null}

      <SlotGrid>
        {Array.from({ length: CHARACTER_SLOT_COUNT }, (_, index) => {
          const character = characters.at(index)
          if (!character) {
            return (
              <CharacterSlotEmpty
                key={`slot-${index + 1}`}
                canCreate={limits.canCreate}
              />
            )
          }
          return <CharacterSlot key={character.id} character={character} />
        })}
      </SlotGrid>

      {!limits.canCreate ? (
        <p className="m-0 text-sm text-mute">
          {m.character_limit_reached({ max: String(limits.maxPerAccount) })}
        </p>
      ) : null}
    </SelectShell>
  )
}

function SlotGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 grid w-full grid-cols-2 gap-3.5 sm:grid-cols-4">
      {children}
    </div>
  )
}

function SelectShell({ children }: { children: ReactNode }) {
  return (
    <section className="animate-rise-in mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-208 flex-col items-center justify-center gap-3.5 px-6 py-10 text-center">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.character_select_kicker()}
      </p>
      <h1 className="m-0 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">
        {m.character_select_title()}
      </h1>
      <p className="m-0 max-w-xl text-[1.05rem] text-ink-soft">
        {m.character_select_subtitle()}
      </p>
      {children}
    </section>
  )
}
