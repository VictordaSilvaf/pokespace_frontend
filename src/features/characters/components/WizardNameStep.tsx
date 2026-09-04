import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
    <div className="rise-in max-w-md">
      <p className="text-[var(--sea-ink-soft)]">{m.character_name_prompt()}</p>
      <div className="mt-4 space-y-2">
        <Label htmlFor="displayName">{m.character_name_label()}</Label>
        <Input
          id="displayName"
          name="displayName"
          value={value}
          maxLength={DISPLAY_NAME_MAX}
          placeholder={m.character_name_placeholder()}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
        <p className="text-sm text-[var(--sea-ink-soft)]">
          {m.character_name_hint()}
        </p>
        <p className="text-xs text-[var(--sea-ink-soft)]">
          {DISPLAY_NAME_MIN}–{DISPLAY_NAME_MAX}
        </p>
        {error ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
