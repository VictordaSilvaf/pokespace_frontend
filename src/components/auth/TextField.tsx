import type { ComponentProps, ReactNode } from 'react'
import { cn } from '#/lib/utils'

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: ComponentProps<'input'> & {
  label: string
  hint?: string
  error?: string
}) {
  const id = props.id ?? props.name

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-[0.78rem] font-semibold text-ink-soft"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className="w-full rounded-[10px] border border-line bg-[#0c0c13] px-3.5 py-3.5 font-sans text-ink outline-none focus:border-gold/55 focus:shadow-[0_0_0_3px_rgba(249,188,1,0.12)]"
        {...props}
      />
      {error ? (
        <p className="text-[0.8rem] text-[#ff8d8d]">{error}</p>
      ) : null}
      {!error && hint ? (
        <p className="text-[0.8rem] text-mute">{hint}</p>
      ) : null}
    </div>
  )
}

export function FormMessage({
  tone = 'notice',
  children,
}: {
  tone?: 'notice' | 'warn'
  children: ReactNode
}) {
  if (!children) {
    return null
  }

  return (
    <p
      className={cn(
        'font-semibold',
        tone === 'warn' ? 'text-[#ff8d8d]' : 'text-gold',
      )}
    >
      {children}
    </p>
  )
}
