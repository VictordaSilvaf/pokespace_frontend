import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { loadActiveCharacterId } from '#/features/characters/active-character'
import { EMPTY_SPRITE_URL } from '#/features/game-data'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

import {
  pokedexDetailQueryOptions,
  pokedexMergedQueryOptions,
} from '../queries'
import {
  ALL_TYPES,
  formatDexId,
  pokedexSpriteUrl
  
  
} from '../types'
import type {PokedexEntry, PokeType} from '../types';
import { TypeBadge } from './TypeBadge'

type PokedexPanelProps = {
  open: boolean
  onClose: () => void
}

type DetailTab = 'info' | 'moves' | 'effectiveness' | 'drops' | 'evolution'
type MetaTab = 'categories' | 'stats'

const overlayEase = [0.22, 1, 0.36, 1] as const

function firstDiscovered(catalog: PokedexEntry[]): PokedexEntry | null {
  for (const entry of catalog) {
    if (entry.discovered) return entry
  }
  return catalog.at(0) ?? null
}

function SpriteImg({
  entry,
  shiny,
  className,
  alt,
}: {
  entry: PokedexEntry
  shiny?: boolean
  className?: string
  alt?: string
}) {
  const [src, setSrc] = useState(() => pokedexSpriteUrl(entry, shiny))

  useEffect(() => {
    setSrc(pokedexSpriteUrl(entry, shiny))
  }, [entry, shiny])

  return (
    <img
      src={src}
      alt={alt ?? ''}
      draggable={false}
      onError={() => setSrc(EMPTY_SPRITE_URL)}
      className={cn('object-contain [image-rendering:pixelated]', className)}
    />
  )
}

export function PokedexPanel({ open, onClose }: PokedexPanelProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<PokeType | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [shiny, setShiny] = useState(false)
  const [detailTab, setDetailTab] = useState<DetailTab>('info')
  const [metaTab, setMetaTab] = useState<MetaTab>('stats')
  const [mounted, setMounted] = useState(false)
  const [characterId, setCharacterId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    setCharacterId(loadActiveCharacterId())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const mergedQuery = useQuery({
    ...pokedexMergedQueryOptions(characterId),
    enabled: open && mounted,
  })

  const catalog = mergedQuery.data?.entries ?? []
  const totalCatalog = mergedQuery.data?.totalCatalog ?? 0
  const seenCount = mergedQuery.data?.seen ?? 0
  const hasCharacter = mergedQuery.data?.hasCharacter ?? false

  useEffect(() => {
    if (!catalog.length) return
    setSelectedId((current) => {
      if (current != null && catalog.some((e) => e.dexId === current)) {
        return current
      }
      const pick = firstDiscovered(catalog)
      return pick ? pick.dexId : null
    })
  }, [catalog])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((entry) => {
      if (typeFilter) {
        if (!entry.discovered || !entry.types?.includes(typeFilter)) return false
      }
      if (!q) return true
      if (formatDexId(entry.dexId).includes(q) || String(entry.dexId) === q) {
        return true
      }
      if (!entry.discovered || !entry.name) return false
      return entry.name.toLowerCase().includes(q)
    })
  }, [catalog, query, typeFilter])

  const selected =
    catalog.find((entry) => entry.dexId === selectedId) ?? null

  const detailQuery = useQuery({
    ...pokedexDetailQueryOptions(
      selectedId ?? 0,
      open && selected?.discovered === true && selectedId != null,
    ),
  })

  const selectedView: PokedexEntry | null = selected
    ? {
        ...selected,
        ...(selected.discovered && detailQuery.data
          ? detailQuery.data
          : null),
        discovered: selected.discovered,
        caught: selected.caught,
      }
    : null

  if (!mounted) return null

  const progress =
    totalCatalog > 0 ? seenCount / totalCatalog : 0

  const canShiny = Boolean(
    selectedView && selectedView.hasShiny && selectedView.shinySpriteUrl,
  )

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="pokedex-overlay"
          className="pointer-events-auto fixed inset-0 z-220 flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-5"
          role="presentation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: overlayEase }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={m.pokedex_title()}
            className="flex h-[min(92dvh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[18px] border border-line bg-[rgba(16,16,24,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: overlayEase }}
          >
            <header className="flex items-center gap-4 border-b border-line px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-end gap-3">
                  <h2 className="m-0 text-2xl font-extrabold tracking-[0.08em] text-gold uppercase sm:text-3xl">
                    {m.pokedex_title()}
                  </h2>
                  <p className="m-0 pb-1 text-sm font-semibold text-ink-soft">
                    {m.pokedex_progress({
                      found: String(seenCount),
                      total: String(totalCatalog || '—'),
                    })}
                  </p>
                </div>
                <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${Math.max(4, progress * 100)}%` }}
                  />
                </div>
                {!hasCharacter ? (
                  <p className="mt-2 mb-0 text-xs text-ink-soft">
                    {m.pokedex_select_character()}
                  </p>
                ) : null}
                {mergedQuery.isError ? (
                  <p className="mt-2 mb-0 text-xs text-[#ff8d8d]">
                    {mergedQuery.error instanceof Error
                      ? mergedQuery.error.message
                      : m.pokedex_no_data()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={m.pokedex_close()}
                onClick={onClose}
                className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-line bg-white/5 text-ink hover:bg-white/10"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-[minmax(16rem,20rem)_1fr] md:p-4">
              <aside className="flex min-h-0 flex-col gap-3 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={m.pokedex_search()}
                    className="h-10 w-full rounded-lg border border-line bg-black/35 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-gold/50"
                  />
                </label>

                <ul className="m-0 min-h-0 flex-1 list-none space-y-1 overflow-y-auto p-0 pr-1 scrollbar-none">
                  {mergedQuery.isLoading ? (
                    <li className="px-2 py-3 text-sm text-ink-soft">
                      {m.pokedex_no_data()}
                    </li>
                  ) : null}
                  {filtered.map((entry) => {
                    const active = entry.dexId === selectedId
                    return (
                      <li key={entry.dexId}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(entry.dexId)
                            setShiny(false)
                          }}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors',
                            active
                              ? 'border-gold/70 bg-gold/10'
                              : 'border-transparent hover:border-white/10 hover:bg-white/5',
                          )}
                        >
                          <div className="grid size-9 place-items-center overflow-hidden rounded-md bg-black/40">
                            {entry.discovered ? (
                              <SpriteImg
                                entry={entry}
                                className="size-8"
                              />
                            ) : (
                              <span className="text-sm text-ink-soft">?</span>
                            )}
                          </div>
                          <span className="w-8 shrink-0 text-xs font-bold text-ink-soft">
                            {formatDexId(entry.dexId)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                            {entry.discovered
                              ? entry.name
                              : m.pokedex_unknown_name()}
                          </span>
                          {entry.discovered && entry.types ? (
                            <span className="flex shrink-0 gap-0.5">
                              {entry.types.map((type) => (
                                <TypeBadge key={type} type={type} size="sm" />
                              ))}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div>
                  <p className="mb-2 text-[0.7rem] font-bold tracking-wide text-ink-soft uppercase">
                    {m.pokedex_filter_type()}
                  </p>
                  <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 md:grid-cols-6">
                    {ALL_TYPES.map((type) => (
                      <TypeBadge
                        key={type}
                        type={type}
                        size="md"
                        selected={typeFilter === type}
                        onClick={() =>
                          setTypeFilter((current) =>
                            current === type ? null : type,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </aside>

              <section className="grid min-h-0 grid-rows-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3">
                <div className="grid min-h-0 gap-3 overflow-hidden rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="flex min-h-0 flex-col">
                    {selectedView?.discovered ? (
                      <>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink-soft">
                            {m.pokedex_number({
                              id: formatDexId(selectedView.dexId),
                            })}
                          </span>
                          <h3 className="m-0 text-xl font-extrabold tracking-wide text-ink uppercase">
                            {selectedView.name}
                          </h3>
                          <span className="flex gap-1">
                            {selectedView.types?.map((type) => (
                              <TypeBadge key={type} type={type} size="md" />
                            ))}
                          </span>
                          {selectedView.caught ? (
                            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-gold uppercase">
                              caught
                            </span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          disabled={!canShiny}
                          onClick={() => {
                            if (canShiny) setShiny((value) => !value)
                          }}
                          className={cn(
                            'relative mx-auto grid min-h-40 w-full max-w-xs flex-1 place-items-center rounded-[14px] border border-white/8 bg-[radial-gradient(circle_at_50%_30%,rgba(249,188,1,0.12),transparent_55%),rgba(0,0,0,0.35)]',
                            canShiny
                              ? 'cursor-pointer'
                              : 'cursor-default opacity-95',
                          )}
                          title={
                            canShiny
                              ? m.pokedex_toggle_form()
                              : m.pokedex_form_normal()
                          }
                        >
                          <SpriteImg
                            entry={selectedView}
                            shiny={shiny && canShiny}
                            alt={selectedView.name ?? ''}
                            className="max-h-44 w-auto"
                          />
                        </button>

                        {canShiny ? (
                          <>
                            <p className="mt-2 mb-2 text-center text-[0.7rem] text-ink-soft">
                              {m.pokedex_toggle_form()}
                            </p>
                            <div className="flex justify-center gap-2">
                              <FormButton
                                active={!shiny}
                                onClick={() => setShiny(false)}
                                label={m.pokedex_form_normal()}
                              />
                              <FormButton
                                active={shiny}
                                onClick={() => setShiny(true)}
                                label={m.pokedex_form_shiny()}
                              />
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="grid flex-1 place-items-center text-center">
                        <div>
                          <p className="m-0 text-sm font-bold text-ink-soft">
                            {m.pokedex_number({
                              id: formatDexId(selectedView?.dexId ?? 0),
                            })}
                          </p>
                          <p className="mt-2 text-2xl font-extrabold text-ink">
                            {m.pokedex_unknown_name()}
                          </p>
                          <p className="mt-2 text-sm text-ink-soft">
                            {m.pokedex_undiscovered()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex min-h-0 flex-col rounded-[14px] border border-line bg-black/25 p-3">
                    {selectedView?.discovered ? (
                      <>
                        <dl className="m-0 grid flex-1 content-start gap-2 text-sm">
                          {metaTab === 'stats' && selectedView.baseStats ? (
                            <>
                              <MetaRow
                                label="HP"
                                value={String(selectedView.baseStats.hp)}
                              />
                              <MetaRow
                                label="Atk"
                                value={String(selectedView.baseStats.attack)}
                              />
                              <MetaRow
                                label="Def"
                                value={String(selectedView.baseStats.defense)}
                              />
                              <MetaRow
                                label="SpA"
                                value={String(
                                  selectedView.baseStats.specialAttack,
                                )}
                              />
                              <MetaRow
                                label="SpD"
                                value={String(
                                  selectedView.baseStats.specialDefense,
                                )}
                              />
                              <MetaRow
                                label="Spe"
                                value={String(selectedView.baseStats.speed)}
                              />
                            </>
                          ) : (
                            <>
                              <MetaRow
                                label={m.pokedex_category()}
                                value={selectedView.category ?? '—'}
                              />
                              <MetaRow
                                label={m.pokedex_height()}
                                value={
                                  selectedView.heightM != null
                                    ? `${selectedView.heightM.toFixed(1)} m`
                                    : '—'
                                }
                              />
                              <MetaRow
                                label={m.pokedex_weight()}
                                value={
                                  selectedView.weightKg != null
                                    ? `${selectedView.weightKg.toFixed(1)} kg`
                                    : '—'
                                }
                              />
                              <MetaRow
                                label={m.pokedex_level()}
                                value={
                                  selectedView.level != null
                                    ? String(selectedView.level)
                                    : '—'
                                }
                              />
                              <MetaRow
                                label={m.pokedex_abilities()}
                                value={
                                  selectedView.abilities?.join(', ') ?? '—'
                                }
                              />
                            </>
                          )}
                        </dl>
                        <div className="mt-3 flex gap-2">
                          <FormButton
                            active={metaTab === 'categories'}
                            onClick={() => setMetaTab('categories')}
                            label={m.pokedex_tab_categories()}
                          />
                          <FormButton
                            active={metaTab === 'stats'}
                            onClick={() => setMetaTab('stats')}
                            label={m.pokedex_tab_stats()}
                          />
                        </div>
                        {metaTab === 'stats' && !selectedView.baseStats ? (
                          <p className="mt-2 mb-0 text-xs text-ink-soft">
                            {m.pokedex_stats_placeholder()}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="m-0 text-sm text-ink-soft">
                        {m.pokedex_undiscovered()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)]">
                  <div className="flex flex-wrap gap-1 border-b border-line p-2">
                    {(
                      [
                        ['info', m.pokedex_tab_info()],
                        ['moves', m.pokedex_tab_moves()],
                        ['effectiveness', m.pokedex_tab_effectiveness()],
                        ['drops', m.pokedex_tab_drops()],
                        ['evolution', m.pokedex_tab_evolution()],
                      ] as const
                    ).map(([id, label]) => (
                      <FormButton
                        key={id}
                        active={detailTab === id}
                        onClick={() => setDetailTab(id)}
                        label={label}
                      />
                    ))}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-none">
                    <DetailBody entry={selectedView} tab={detailTab} />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function FormButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border px-3 py-1.5 text-[0.7rem] font-bold tracking-wide uppercase transition-colors',
        active
          ? 'border-gold/60 bg-gold text-gold-ink'
          : 'border-line bg-white/5 text-ink-soft hover:bg-white/10 hover:text-ink',
      )}
    >
      {label}
    </button>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 border-b border-white/6 py-1.5 last:border-0">
      <dt className="m-0 font-semibold text-ink-soft">{label}</dt>
      <dd className="m-0 font-bold text-ink">{value}</dd>
    </div>
  )
}

function DetailBody({
  entry,
  tab,
}: {
  entry: PokedexEntry | null
  tab: DetailTab
}) {
  if (!entry?.discovered) {
    return (
      <p className="m-0 text-sm text-ink-soft">{m.pokedex_undiscovered()}</p>
    )
  }

  if (tab === 'info') {
    return (
      <p className="m-0 max-w-prose text-sm leading-relaxed text-ink">
        {entry.description ?? m.pokedex_no_data()}
      </p>
    )
  }

  if (tab === 'moves') {
    if (!entry.moves?.length) {
      return (
        <p className="m-0 text-sm text-ink-soft">{m.pokedex_no_data()}</p>
      )
    }
    return (
      <div>
        <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-6 md:grid-cols-8">
          {entry.moves.map((move) => (
            <li key={move.id}>
              <div
                title={move.name}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[14px] border border-line bg-black/30 p-1"
              >
                <TypeBadge type={move.type} size="md" />
                <span className="line-clamp-2 text-center text-[0.58rem] font-semibold text-ink">
                  {move.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (tab === 'effectiveness') {
    return (
      <p className="m-0 text-sm text-ink-soft">
        {m.pokedex_effectiveness_placeholder()}
      </p>
    )
  }

  if (tab === 'drops') {
    return (
      <p className="m-0 text-sm text-ink-soft">{m.pokedex_drops_placeholder()}</p>
    )
  }

  return (
    <p className="m-0 text-sm font-semibold text-ink">
      {entry.evolution ?? m.pokedex_no_data()}
    </p>
  )
}
