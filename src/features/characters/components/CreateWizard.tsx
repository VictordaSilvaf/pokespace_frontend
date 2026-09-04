import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

import { DISPLAY_NAME_MIN } from '../config'
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
  if (trimmed.length < DISPLAY_NAME_MIN || trimmed.length > 16) {
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
      <ol className="step-pills">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              'step-pill',
              i === stepIndex && 'is-active',
              i < stepIndex && 'is-done',
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
          <div className="rise-in" style={{ display: 'grid', gap: '0.85rem' }}>
            <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
              {m.character_confirm_prompt()}
            </p>
            <dl className="confirm-panel">
              <div>
                <dt>{m.character_confirm_world()}</dt>
                <dd>{world?.name}</dd>
              </div>
              <div>
                <dt>{m.character_confirm_skin()}</dt>
                <dd>
                  {skin ? (
                    <img src={skin.imageUrl} alt={skin.name} />
                  ) : null}
                  {skin?.name}
                </dd>
              </div>
              <div>
                <dt>{m.character_confirm_name()}</dt>
                <dd>{displayName.trim()}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p className="field-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="form-actions">
        {step === 'world' ? (
          <Link to="/characters" className="btn btn-ghost">
            {m.character_cancel()}
          </Link>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={goBack}>
            {m.character_back()}
          </button>
        )}

        {step !== 'confirm' ? (
          <button
            type="button"
            className="btn btn-gold"
            disabled={!canContinue()}
            onClick={goNext}
          >
            {m.character_next()}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-gold"
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

function Unavailable() {
  return (
    <div className="rise-in" style={{ display: 'grid', gap: '0.85rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
        {m.character_create_unavailable_title()}
      </h2>
      <p style={{ margin: 0, color: 'var(--ink-soft)', maxWidth: '28rem' }}>
        {m.character_create_unavailable_body()}
      </p>
      <Link to="/characters" className="btn btn-ghost" style={{ width: 'fit-content' }}>
        {m.character_back()}
      </Link>
    </div>
  )
}

function WizardShell({ children }: { children: ReactNode }) {
  return (
    <section className="section-block section-wide rise-in">
      <p className="status-line">{m.character_create_kicker()}</p>
      <h1>{m.character_create_title()}</h1>
      {children}
    </section>
  )
}
