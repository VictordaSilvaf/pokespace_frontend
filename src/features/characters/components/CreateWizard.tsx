import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'

import LocaleSwitcher from '#/components/LocaleSwitcher'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

import { DISPLAY_NAME_MAX, DISPLAY_NAME_MIN } from '../config'
import { characterCreateErrorMessage } from '../errors'
import {
  characterKeys,
  createCharacterMutationFn,
  creationOptionsQueryOptions,
} from '../queries'
import { WizardNameStep } from './WizardNameStep'
import { WizardSkinStep } from './WizardSkinStep'
import { WizardWorldStep } from './WizardWorldStep'

type Step = 'world' | 'skin' | 'name' | 'confirm'

const steps: Step[] = ['world', 'skin', 'name', 'confirm']

function stepLabel(step: Step): string {
  switch (step) {
    case 'world':
      return m.character_step_world()
    case 'skin':
      return m.character_step_skin()
    case 'name':
      return m.character_step_name()
    case 'confirm':
      return m.character_step_confirm()
  }
}

function validateDisplayName(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length < DISPLAY_NAME_MIN || trimmed.length > DISPLAY_NAME_MAX) {
    return m.character_error_validation()
  }
  return null
}

export function CreateWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useQuery(creationOptionsQueryOptions())

  const [step, setStep] = useState<Step>('world')
  const [worldId, setWorldId] = useState<string | null>(null)
  const [skinId, setSkinId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  )

  const createMutation = useMutation({
    mutationFn: createCharacterMutationFn,
    onSuccess: async (result) => {
      if (!result.ok) {
        setSubmitError(characterCreateErrorMessage(result.code))
        if (result.code === 'limit_reached') {
          await navigate({ to: '/characters' })
        }
        // New key only when the previous attempt was not a transient rate limit
        // reuse — keep same key for true retries of the same submit.
        if (result.code !== 'rate_limit') {
          setIdempotencyKey(crypto.randomUUID())
        }
        return
      }

      await queryClient.invalidateQueries({ queryKey: characterKeys.all })
      await navigate({ to: '/characters' })
    },
    onError: () => {
      setSubmitError(m.character_error_generic())
      setIdempotencyKey(crypto.randomUUID())
    },
  })

  if (isPending) {
    return (
      <WizardShell>
        <Skeleton className="mt-8 h-40 rounded-2xl" />
      </WizardShell>
    )
  }

  if (isError) {
    return (
      <WizardShell>
        <Unavailable />
      </WizardShell>
    )
  }

  if (data.worlds.length === 0 || data.skins.length === 0) {
    return (
      <WizardShell>
        <Unavailable />
      </WizardShell>
    )
  }

  const world = data.worlds.find((w) => w.id === worldId)
  const skin = data.skins.find((s) => s.id === skinId)
  const stepIndex = steps.indexOf(step)

  function goNext() {
    setSubmitError(null)
    if (step === 'world' && worldId) setStep('skin')
    else if (step === 'skin' && skinId) setStep('name')
    else if (step === 'name') {
      const err = validateDisplayName(displayName)
      setNameError(err)
      if (!err) setStep('confirm')
    }
  }

  function goBack() {
    setSubmitError(null)
    if (step === 'skin') setStep('world')
    else if (step === 'name') setStep('skin')
    else if (step === 'confirm') setStep('name')
  }

  function canContinue(): boolean {
    if (step === 'world') return Boolean(worldId)
    if (step === 'skin') return Boolean(skinId)
    if (step === 'name') return displayName.trim().length >= DISPLAY_NAME_MIN
    return Boolean(worldId && skinId && !validateDisplayName(displayName))
  }

  function onSubmit() {
    const err = validateDisplayName(displayName)
    if (err || !worldId || !skinId) {
      setNameError(err)
      return
    }
    setSubmitError(null)
    createMutation.mutate({
      displayName: displayName.trim(),
      worldId,
      skinId,
      idempotencyKey,
    })
  }

  return (
    <WizardShell>
      <ol className="mt-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase',
              i === stepIndex
                ? 'border-[var(--lagoon-deep)] bg-[var(--lagoon)]/20 text-[var(--sea-ink)]'
                : i < stepIndex
                  ? 'border-[var(--line)] text-[var(--sea-ink)]'
                  : 'border-transparent text-[var(--sea-ink-soft)]',
            )}
          >
            {stepLabel(s)}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step === 'world' ? (
          <WizardWorldStep
            worlds={data.worlds}
            selectedId={worldId}
            onSelect={setWorldId}
          />
        ) : null}
        {step === 'skin' ? (
          <WizardSkinStep
            skins={data.skins}
            selectedId={skinId}
            onSelect={setSkinId}
          />
        ) : null}
        {step === 'name' ? (
          <WizardNameStep
            value={displayName}
            error={nameError}
            onChange={(v) => {
              setDisplayName(v)
              setNameError(null)
            }}
          />
        ) : null}
        {step === 'confirm' ? (
          <div className="rise-in max-w-lg">
            <p className="text-[var(--sea-ink-soft)]">
              {m.character_confirm_prompt()}
            </p>
            <dl className="mt-4 space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-[var(--sea-ink-soft)]">
                  {m.character_confirm_world()}
                </dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {world?.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[var(--sea-ink-soft)]">
                  {m.character_confirm_skin()}
                </dt>
                <dd className="flex items-center gap-2 font-semibold text-[var(--sea-ink)]">
                  {skin ? (
                    <img
                      src={skin.imageUrl}
                      alt={skin.name}
                      className="size-8 rounded-md object-cover"
                    />
                  ) : null}
                  {skin?.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-[var(--sea-ink-soft)]">
                  {m.character_confirm_name()}
                </dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {displayName.trim()}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step === 'world' ? (
          <Button asChild variant="outline">
            <Link to="/characters">{m.character_cancel()}</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={goBack}>
            {m.character_back()}
          </Button>
        )}

        {step !== 'confirm' ? (
          <Button type="button" disabled={!canContinue()} onClick={goNext}>
            {m.character_next()}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={createMutation.isPending || !canContinue()}
            onClick={onSubmit}
          >
            {createMutation.isPending
              ? m.character_submitting()
              : m.character_submit()}
          </Button>
        )}
      </div>
    </WizardShell>
  )
}

function Unavailable() {
  return (
    <div className="rise-in mt-8">
      <h2 className="display-title text-2xl text-[var(--sea-ink)]">
        {m.character_create_unavailable_title()}
      </h2>
      <p className="mt-2 max-w-md text-[var(--sea-ink-soft)]">
        {m.character_create_unavailable_body()}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/characters">{m.character_back()}</Link>
      </Button>
    </div>
  )
}

function WizardShell({ children }: { children: ReactNode }) {
  return (
    <main className="page-wrap py-10 sm:py-14">
      <div className="mb-6 flex justify-end">
        <LocaleSwitcher />
      </div>
      <section className="island-shell rise-in rounded-3xl px-6 py-8 sm:px-10 sm:py-10">
        <p className="island-kicker">{m.character_create_kicker()}</p>
        <h1 className="display-title mt-3 text-4xl text-[var(--sea-ink)] sm:text-5xl">
          <span className="block text-[var(--lagoon-deep)]">{m.app_brand()}</span>
          <span className="mt-1 block text-[clamp(1.75rem,4vw,2.5rem)] font-medium">
            {m.character_create_title()}
          </span>
        </h1>
        {children}
      </section>
    </main>
  )
}
