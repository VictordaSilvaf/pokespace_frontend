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
    <div className="animate-rise-in grid gap-3.5">
      <p className="m-0 text-ink-soft">{m.character_skin_prompt()}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {skins.map((skin) => {
          const selected = skin.id === selectedId
          return (
            <button
              key={skin.id}
              type="button"
              onClick={() => onSelect(skin.id)}
              className={cn(
                'grid cursor-pointer justify-items-center gap-2 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] px-3 py-4 text-center font-sans text-ink transition-[transform,border-color,box-shadow] duration-160 hover:-translate-y-px hover:border-gold/35',
                selected && 'border-gold shadow-[0_0_0_2px_rgba(249,188,1,0.2)]',
              )}
            >
              <img
                src={skin.imageUrl}
                alt={skin.name}
                className="size-[4.5rem] rounded-xl bg-[#0c0c13] object-cover"
              />
              <span className="text-[0.92rem] font-bold">{skin.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
