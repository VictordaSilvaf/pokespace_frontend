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
    <div className="rise-in" style={{ display: 'grid', gap: '0.85rem' }}>
      <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
        {m.character_world_prompt()}
      </p>
      <div className="choice-grid">
        {worlds.map((world) => {
          const selected = world.id === selectedId
          return (
            <button
              key={world.id}
              type="button"
              onClick={() => onSelect(world.id)}
              className={cn('choice-card', selected && 'is-selected')}
            >
              <span>{world.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
