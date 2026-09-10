import { Link } from '@tanstack/react-router'
import { BrandMark } from '#/components/brand/BrandMark'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

export function NotFoundScreen() {
  return (
    <main className="grid min-h-[60svh] place-items-center px-4 py-12">
      <section className="animate-rise-in grid w-full max-w-md gap-4 text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <p className="m-0 text-[0.78rem] font-bold tracking-[0.14em] text-mute uppercase">
          404
        </p>
        <h1 className="m-0 text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold tracking-[-0.03em]">
          {m.not_found_title()}
        </h1>
        <p className="m-0 text-[1.05rem] text-ink-soft">{m.not_found_support()}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Link to="/login" className={pillButton({ variant: 'gold' })}>
            {m.cta_back_home()}
          </Link>
          <Link to="/characters" className={pillButton({ variant: 'ghost' })}>
            {m.nav_characters()}
          </Link>
        </div>
      </section>
    </main>
  )
}
