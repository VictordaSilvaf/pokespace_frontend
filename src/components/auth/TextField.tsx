import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { applyMask, type FieldMask } from '#/lib/form/masks'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

const MASK_DEFAULTS: Record<
  FieldMask,
  Partial<ComponentProps<'input'>>
> = {
  phone: {
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
    maxLength: 15,
    placeholder: '(11) 99999-9999',
  },
  otp: {
    inputMode: 'numeric',
    autoComplete: 'one-time-code',
    maxLength: 6,
    placeholder: '000000',
  },
  username: {
    autoComplete: 'username',
    maxLength: 20,
    spellCheck: false,
    autoCapitalize: 'none',
  },
  displayName: {
    maxLength: 16,
    spellCheck: false,
    autoCapitalize: 'none',
  },
}

export function TextField({
  label,
  hint,
  error,
  className,
  type = 'text',
  mask,
  onChange,
  ...props
}: ComponentProps<'input'> & {
  label: string
  hint?: string
  error?: string
  mask?: FieldMask
}) {
  const id = props.id ?? props.name
  const isPassword = type === 'password'
  const [visible, setVisible] = useState(false)
  const maskDefaults = mask ? MASK_DEFAULTS[mask] : undefined
  const {
    type: maskType,
    ...maskInputProps
  } = maskDefaults ?? {}
  const inputType = isPassword
    ? visible
      ? 'text'
      : 'password'
    : (maskType ?? type)

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-[0.78rem] font-semibold text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full rounded-[10px] border border-line bg-[#0c0c13] px-3.5 py-3.5 font-sans text-ink outline-none focus:border-gold/55 focus:shadow-[0_0_0_3px_rgba(249,188,1,0.12)]',
            isPassword && 'pr-11',
          )}
          {...maskInputProps}
          {...props}
          type={inputType}
          onChange={(event) => {
            if (mask) {
              event.target.value = applyMask(mask, event.target.value)
            }
            onChange?.(event)
          }}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? m.password_hide() : m.password_show()}
            onClick={() => setVisible((current) => !current)}
            className="absolute top-1/2 right-2.5 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-mute transition-colors hover:bg-white/6 hover:text-ink"
          >
            {visible ? (
              <EyeOff className="size-4" strokeWidth={1.75} />
            ) : (
              <Eye className="size-4" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
      </div>
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
