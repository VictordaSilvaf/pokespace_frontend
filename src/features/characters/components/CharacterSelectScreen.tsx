import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import LocaleSwitcher from '#/components/LocaleSwitcher'
import { Skeleton } from '#/components/ui/skeleton'
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
        <p className="text-[var(--sea-ink-soft)]">{m.character_loading()}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </SelectShell>
    )
  }

  if (isError) {
    return (
      <SelectShell>
        <p className="text-[var(--sea-ink-soft)]">{m.character_load_error()}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-[var(--lagoon-deep)]"
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
        <div className="rise-in mt-10 flex flex-col items-start gap-4">
          <h2 className="display-title text-3xl text-[var(--sea-ink)]">
            {m.character_empty_title()}
          </h2>
          <p className="max-w-md text-[var(--sea-ink-soft)]">
            {m.character_empty_body()}
          </p>
          <CharacterCreateCta />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {characters.map((character) => (
              <CharacterSlot key={character.id} character={character} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {limits.canCreate ? (
              <CharacterCreateCta />
            ) : (
              <p className="text-sm font-medium text-[var(--sea-ink-soft)]">
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
    <main className="page-wrap py-10 sm:py-14">
      <div className="mb-6 flex justify-end">
        <LocaleSwitcher />
      </div>
      <section className="island-shell rise-in rounded-3xl px-6 py-8 sm:px-10 sm:py-10">
        <p className="island-kicker">{m.character_select_kicker()}</p>
        <h1 className="display-title mt-3 text-4xl text-[var(--sea-ink)] sm:text-5xl">
          <span className="block text-[var(--lagoon-deep)]">{m.app_brand()}</span>
          <span className="mt-1 block text-[clamp(1.75rem,4vw,2.5rem)] font-medium">
            {m.character_select_title()}
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-[var(--sea-ink-soft)]">
          {m.character_select_subtitle()}
        </p>
        {children}
      </section>
    </main>
  )
}
