import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'

type Locale = (typeof locales)[number]

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
}

export default function LocaleSwitcher() {
  const currentLocale = getLocale()

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{m.language_label()}</span>
      <select
        value={currentLocale}
        aria-label={m.language_label()}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="cursor-pointer appearance-none rounded-lg border border-line bg-[rgba(16,16,24,0.95)] py-1.5 pr-8 pl-2.5 text-sm font-semibold text-ink-soft outline-none transition-colors hover:border-gold/40 hover:text-ink focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%9aa0b2' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.55rem center',
        }}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </option>
        ))}
      </select>
    </label>
  )
}
