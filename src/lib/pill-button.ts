import { cva, type VariantProps } from 'class-variance-authority'

/** Shared pill CTA used across marketing + auth surfaces. */
export const pillButton = cva(
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-sans text-inherit font-bold no-underline transition-[transform,background-color,color,border-color] duration-160 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
  {
    variants: {
      variant: {
        gold: 'bg-gold text-gold-ink hover:bg-gold-hover hover:text-gold-ink',
        ghost:
          'bg-transparent text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] hover:bg-white/6 hover:text-ink',
      },
      size: {
        md: 'px-5 py-3.5',
        sm: 'px-4 py-2 text-sm',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
      block: false,
    },
  },
)

export type PillButtonVariants = VariantProps<typeof pillButton>
