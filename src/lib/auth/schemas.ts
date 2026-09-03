import { z } from 'zod'
import { m } from '#/paraglide/messages'

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, m.err_username())

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, m.err_email())

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length >= 10 && value.length <= 15, m.err_phone())

export const passwordSchema = z.string().min(8, m.err_password())

export const identifierSchema = z.string().trim().min(3, m.field_required())

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, m.err_otp())

export const tokenSchema = z.string().trim().min(8, m.field_required())

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, m.field_required()),
})

export const registerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  username: usernameSchema,
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  username: usernameSchema,
})

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
})

export const verifyEmailSchema = z.object({
  token: tokenSchema,
})

export const twoFactorSchema = z.object({
  code: otpSchema,
})

export const verifyPhoneSchema = z.object({
  code: otpSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, m.field_required()),
  newPassword: passwordSchema,
})

export const updateProfileSchema = z
  .object({
    email: z.string().trim(),
    phone: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    const email = value.email.trim()
    const phone = value.phone.replace(/\D/g, '')

    if (!email && !phone) {
      ctx.addIssue({
        code: 'custom',
        message: m.field_required(),
        path: ['email'],
      })
    }

    if (email) {
      const parsed = emailSchema.safeParse(email)
      if (!parsed.success) {
        ctx.addIssue({
          code: 'custom',
          message: m.err_email(),
          path: ['email'],
        })
      }
    }

    if (value.phone.trim() && (phone.length < 10 || phone.length > 15)) {
      ctx.addIssue({
        code: 'custom',
        message: m.err_phone(),
        path: ['phone'],
      })
    }
  })

export const deleteAccountSchema = z.object({
  password: z.string().min(1, m.field_required()),
})
