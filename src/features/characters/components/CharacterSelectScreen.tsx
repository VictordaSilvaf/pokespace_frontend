import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

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
        <p style={{ color: 'var(--ink-soft)' }}>{m.character_loading()}</p>
        <div className="character-grid">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </SelectShell>
    )
  }

  if (isError) {
    return (
      <SelectShell>
        <p className="warn">{m.character_load_error()}</p>
        <button
          type="button"
          className="btn btn-ghost"
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
        <div className="empty-cta rise-in">
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            {m.character_empty_title()}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-soft)', maxWidth: '28rem' }}>
            {m.character_empty_body()}
          </p>
          <CharacterCreateCta />
        </div>
      ) : (
        <>
          <div className="character-grid">
            {characters.map((character) => (
              <CharacterSlot key={character.id} character={character} />
            ))}
          </div>

          <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
            {limits.canCreate ? (
              <CharacterCreateCta />
            ) : (
              <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>
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
    <section className="section-block section-wide rise-in">
      <p className="status-line">{m.character_select_kicker()}</p>
      <h1>{m.character_select_title()}</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem', margin: 0 }}>
        {m.character_select_subtitle()}
      </p>
      {children}
    </section>
  )
}
