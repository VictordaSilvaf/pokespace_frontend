import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'

export default function LocaleSwitcher() {
  const currentLocale = getLocale()

  return (
    <div className="flex gap-1.5" aria-label={m.language_label()}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => setLocale(locale)}
          aria-pressed={locale === currentLocale}
          className={cn(
            'cursor-pointer border-0 bg-transparent p-0.5 font-sans font-bold text-mute',
            locale === currentLocale && 'text-gold',
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
