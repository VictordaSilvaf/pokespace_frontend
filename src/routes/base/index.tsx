import { Link, createFileRoute } from '@tanstack/react-router'
import { KeyRound, MonitorSmartphone, Shield } from 'lucide-react'

import LocaleSwitcher from '#/components/LocaleSwitcher'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/')({ component: SettingsHome })

function SettingsHome() {
  return (
    <section className="animate-rise-in mx-auto grid w-full max-w-3xl gap-4 px-6 pt-10 pb-14">
      <div className="grid gap-2 text-center sm:text-left">
        <p className="m-0 text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
          {m.settings_kicker()}
        </p>
        <h1 className="m-0 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.03em]">
          {m.settings_title()}
        </h1>
        <p className="m-0 text-[1.05rem] text-ink-soft">{m.settings_support()}</p>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        <li>
          <Link
            to="/base/security"
            className="flex h-full flex-col gap-2 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-4 text-inherit no-underline transition-colors hover:border-gold/35 hover:bg-[rgba(22,22,31,0.95)]"
          >
            <Shield className="size-5 text-gold" strokeWidth={1.75} />
            <h2 className="m-0 text-base font-extrabold">{m.nav_security()}</h2>
            <p className="m-0 text-sm text-ink-soft">
              {m.settings_security_blurb()}
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="/base/sessions"
            className="flex h-full flex-col gap-2 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-4 text-inherit no-underline transition-colors hover:border-gold/35 hover:bg-[rgba(22,22,31,0.95)]"
          >
            <MonitorSmartphone className="size-5 text-gold" strokeWidth={1.75} />
            <h2 className="m-0 text-base font-extrabold">{m.nav_sessions()}</h2>
            <p className="m-0 text-sm text-ink-soft">
              {m.settings_sessions_blurb()}
            </p>
          </Link>
        </li>
        <li className="sm:col-span-2">
          <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-[rgba(16,16,24,0.88)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <h2 className="m-0 text-base font-extrabold">
                  {m.language_label()}
                </h2>
                <p className="m-0 text-sm text-ink-soft">
                  {m.settings_language_blurb()}
                </p>
              </div>
            </div>
            <LocaleSwitcher />
          </div>
        </li>
      </ul>
    </section>
  )
}
