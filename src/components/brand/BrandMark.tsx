import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Link to="/" className={cn('brand-mark', className)}>
      <span className="brand-orb" />
      <span
        className={cn(
          'display-title',
          compact ? 'text-xl' : 'text-[clamp(2.8rem,12vw,8.5rem)]',
        )}
      >
        {m.brand()}
      </span>
    </Link>
  )
}
