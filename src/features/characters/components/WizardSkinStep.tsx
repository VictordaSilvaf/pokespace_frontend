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
    <div className="rise-in" style={{ display: 'grid', gap: '0.85rem' }}>
      <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
        {m.character_skin_prompt()}
      </p>
      <div className="choice-grid">
        {skins.map((skin) => {
          const selected = skin.id === selectedId
          return (
            <button
              key={skin.id}
              type="button"
              onClick={() => onSelect(skin.id)}
              className={cn('choice-card', selected && 'is-selected')}
            >
              <img src={skin.imageUrl} alt={skin.name} />
              <span>{skin.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
