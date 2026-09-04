import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Skeleton } from '#/components/ui/skeleton'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

import { charactersListQueryOptions } from '../queries'
import { CharacterCreateCta, CharacterSlot } from './CharacterSlot'

export function CharacterSelectScreen() {
  const { data, isPending, isError, refetch } = useQuery(
    charactersListQueryOptions(),
  )

  if (isPending) {
    return (
      <SelectShell>
        <p className="text-ink-soft">{m.character_loading()}</p>
        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </SelectShell>
    )
  }

  if (isError) {
    return (
      <SelectShell>
        <p className="font-semibold text-[#ff8d8d]">
          {m.character_load_error()}
        </p>
        <button
          type="button"
          className={pillButton({ variant: 'ghost' })}
          onClick={() => void refetch()}
        >
          {m.character_next()}
        </button>
      </SelectShell>
    )
  }

  const { characters, limits } = data
  const isEmpty = characters.length === 0

  return (
    <SelectShell>
      {isEmpty ? (
        <div className="animate-rise-in mt-2.5 grid justify-items-start gap-3.5">
          <h2 className="m-0 text-[1.6rem] font-extrabold">
            {m.character_empty_title()}
          </h2>
          <p className="m-0 max-w-[28rem] text-ink-soft">
            {m.character_empty_body()}
          </p>
          <CharacterCreateCta />
        </div>
      ) : (
        <>
          <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
            {characters.map((character) => (
              <CharacterSlot key={character.id} character={character} />
            ))}
          </div>

          <div className="mt-1.5 flex flex-wrap justify-start gap-3">
            {limits.canCreate ? (
              <CharacterCreateCta />
            ) : (
              <p className="font-semibold text-ink-soft">
                {m.character_limit_reached({
                  max: String(limits.maxPerAccount),
                })}
              </p>
            )}
          </div>
        </>
      )}
    </SelectShell>
  )
}

function SelectShell({ children }: { children: ReactNode }) {
  return (
    <section className="animate-rise-in grid max-w-[52rem] gap-3.5 px-6 pt-8 pb-14">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.character_select_kicker()}
      </p>
      <h1 className="m-0 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">
        {m.character_select_title()}
      </h1>
      <p className="m-0 text-[1.05rem] text-ink-soft">
        {m.character_select_subtitle()}
      </p>
      {children}
    </section>
  )
}
