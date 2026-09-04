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
    <Link to="/" className={cn('brand-mark', className)}>
      <span className="brand-p">P</span>
      <span className={cn('brand-word', compact ? 'text-base' : 'text-lg')}>
        Poke<span className="space">Space</span>
      </span>
    </Link>
  )
}
