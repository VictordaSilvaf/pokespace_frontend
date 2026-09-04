import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2 text-inherit no-underline',
        className,
      )}
    >
      <span className="grid size-[1.55rem] shrink-0 place-items-center rounded-full bg-gold text-[0.85rem] font-extrabold text-gold-ink">
        P
      </span>
      <span
        className={cn(
          'font-extrabold tracking-wide uppercase italic',
          compact ? 'text-base' : 'text-lg',
        )}
      >
        Poke<span className="text-gold">Space</span>
      </span>
    </Link>
  )
}
