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
    <div className={cn('field', className)}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="field-error">{error}</p> : null}
      {!error && hint ? <p className="field-hint">{hint}</p> : null}
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

  return <p className={tone}>{children}</p>
}
