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
    <div className="animate-rise-in grid max-w-[26rem] gap-3.5">
      <p className="m-0 text-ink-soft">{m.character_name_prompt()}</p>
      <div className="grid gap-1.5">
        <label
          htmlFor="displayName"
          className="text-[0.78rem] font-semibold text-ink-soft"
        >
          {m.character_name_label()}
        </label>
        <input
          id="displayName"
          name="displayName"
          value={value}
          maxLength={DISPLAY_NAME_MAX}
          placeholder={m.character_name_placeholder()}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className="w-full rounded-[10px] border border-line bg-[#0c0c13] px-3.5 py-3.5 font-sans text-ink outline-none focus:border-gold/55 focus:shadow-[0_0_0_3px_rgba(249,188,1,0.12)]"
        />
        <p className="text-[0.8rem] text-mute">{m.character_name_hint()}</p>
        <p className="text-[0.8rem] text-mute">
          {DISPLAY_NAME_MIN}–{DISPLAY_NAME_MAX}
        </p>
        {error ? (
          <p className="text-[0.8rem] text-[#ff8d8d]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
