import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'
import type { SkinOption } from '../schemas'

type WizardSkinStepProps = {
  skins: SkinOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function WizardSkinStep({
  skins,
  selectedId,
  onSelect,
}: WizardSkinStepProps) {
  return (
    <div className="rise-in">
      <p className="text-[var(--sea-ink-soft)]">{m.character_skin_prompt()}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {skins.map((skin) => {
          const selected = skin.id === selectedId
          return (
            <li key={skin.id}>
              <button
                type="button"
                onClick={() => onSelect(skin.id)}
                className={cn(
                  'feature-card flex w-full flex-col items-center gap-2 rounded-2xl border px-3 py-4',
                  selected
                    ? 'border-[var(--lagoon-deep)] ring-2 ring-[var(--lagoon)]'
                    : 'border-[var(--line)]',
                )}
              >
                <img
                  src={skin.imageUrl}
                  alt={skin.name}
                  className="size-20 rounded-xl bg-[var(--foam)] object-cover"
                />
                <span className="text-sm font-semibold text-[var(--sea-ink)]">
                  {skin.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
