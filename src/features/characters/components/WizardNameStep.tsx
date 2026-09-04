import { m } from '#/paraglide/messages'
import { DISPLAY_NAME_MAX, DISPLAY_NAME_MIN } from '../config'

type WizardNameStepProps = {
  value: string
  error?: string | null
  onChange: (value: string) => void
}

export function WizardNameStep({
  value,
  error,
  onChange,
}: WizardNameStepProps) {
  return (
    <div className="rise-in" style={{ display: 'grid', gap: '0.85rem', maxWidth: '26rem' }}>
      <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
        {m.character_name_prompt()}
      </p>
      <div className="field">
        <label htmlFor="displayName">{m.character_name_label()}</label>
        <input
          id="displayName"
          name="displayName"
          value={value}
          maxLength={DISPLAY_NAME_MAX}
          placeholder={m.character_name_placeholder()}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
        <p className="field-hint">{m.character_name_hint()}</p>
        <p className="field-hint">
          {DISPLAY_NAME_MIN}–{DISPLAY_NAME_MAX}
        </p>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
