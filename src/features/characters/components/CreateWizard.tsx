import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Skeleton } from '#/components/ui/skeleton'
import { pillButton } from '#/lib/pill-button'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

import {
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  DISPLAY_NAME_PATTERN,
} from '../config'
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
  if (
    trimmed.length < DISPLAY_NAME_MIN ||
    trimmed.length > DISPLAY_NAME_MAX ||
    !DISPLAY_NAME_PATTERN.test(trimmed)
  ) {
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
        <Skeleton className="mt-4 h-40 rounded-2xl" />
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

  if (!data.limits.canCreate) {
    return <RedirectToSelect />
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
      <ol className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              'rounded-full border border-transparent px-2.5 py-1.5 text-[0.72rem] font-bold tracking-[0.1em] text-mute uppercase',
              i === stepIndex &&
                'border-gold/45 bg-gold/12 text-gold',
              i < stepIndex && 'border-line text-ink',
            )}
          >
            {stepLabel(s)}
          </li>
        ))}
      </ol>

      <div>
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
          <div className="animate-rise-in grid gap-3.5">
            <p className="m-0 text-ink-soft">{m.character_confirm_prompt()}</p>
            <dl className="grid gap-3 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[0.88rem] text-ink-soft">
                  {m.character_confirm_world()}
                </dt>
                <dd className="m-0 inline-flex items-center gap-2 font-bold">
                  {world?.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[0.88rem] text-ink-soft">
                  {m.character_confirm_skin()}
                </dt>
                <dd className="m-0 inline-flex items-center gap-2 font-bold">
                  {skin ? (
                    <img
                      src={skin.imageUrl}
                      alt={skin.name}
                      className="size-7 rounded-lg object-cover"
                    />
                  ) : null}
                  {skin?.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[0.88rem] text-ink-soft">
                  {m.character_confirm_name()}
                </dt>
                <dd className="m-0 inline-flex items-center gap-2 font-bold">
                  {displayName.trim()}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p className="text-[0.8rem] text-[#ff8d8d]" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        {step === 'world' ? (
          <Link to="/characters" className={pillButton({ variant: 'ghost' })}>
            {m.character_cancel()}
          </Link>
        ) : (
          <button
            type="button"
            className={pillButton({ variant: 'ghost' })}
            onClick={goBack}
          >
            {m.character_back()}
          </button>
        )}

        {step !== 'confirm' ? (
          <button
            type="button"
            className={pillButton({ variant: 'gold' })}
            disabled={!canContinue()}
            onClick={goNext}
          >
            {m.character_next()}
          </button>
        ) : (
          <button
            type="button"
            className={pillButton({ variant: 'gold' })}
            disabled={createMutation.isPending || !canContinue()}
            onClick={onSubmit}
          >
            {createMutation.isPending
              ? m.character_submitting()
              : m.character_submit()}
          </button>
        )}
      </div>
    </WizardShell>
  )
}

function RedirectToSelect() {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({ to: '/characters' })
  }, [navigate])

  return (
    <WizardShell>
      <p className="text-ink-soft">{m.character_loading()}</p>
    </WizardShell>
  )
}

function Unavailable() {
  return (
    <div className="animate-rise-in grid gap-3.5">
      <h2 className="m-0 text-2xl font-extrabold">
        {m.character_create_unavailable_title()}
      </h2>
      <p className="m-0 max-w-[28rem] text-ink-soft">
        {m.character_create_unavailable_body()}
      </p>
      <Link
        to="/characters"
        className={cn(pillButton({ variant: 'ghost' }), 'w-fit')}
      >
        {m.character_back()}
      </Link>
    </div>
  )
}

function WizardShell({ children }: { children: ReactNode }) {
  return (
    <section className="animate-rise-in grid max-w-[52rem] gap-3.5 px-6 pt-8 pb-14">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.character_create_kicker()}
      </p>
      <h1 className="m-0 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">
        {m.character_create_title()}
      </h1>
      {children}
    </section>
  )
}
