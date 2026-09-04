import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'
import type { WorldOption } from '../schemas'

type WizardWorldStepProps = {
  worlds: WorldOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function WizardWorldStep({
  worlds,
  selectedId,
  onSelect,
}: WizardWorldStepProps) {
  return (
    <div className="rise-in">
      <p className="text-[var(--sea-ink-soft)]">{m.character_world_prompt()}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {worlds.map((world) => {
          const selected = world.id === selectedId
          return (
            <li key={world.id}>
              <button
                type="button"
                onClick={() => onSelect(world.id)}
                className={cn(
                  'feature-card w-full rounded-2xl border px-4 py-5 text-left',
                  selected
                    ? 'border-[var(--lagoon-deep)] ring-2 ring-[var(--lagoon)]'
                    : 'border-[var(--line)]',
                )}
              >
                <span className="display-title text-xl text-[var(--sea-ink)]">
                  {world.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
