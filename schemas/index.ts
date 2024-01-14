import { UserRole } from '@prisma/client'
import * as z from 'zod'

export const SettingsSchema = z
  .object({
    name: z.optional(z.string().trim()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(
      z
        .string()
        .trim()
        .email('Please enter a valid email address.')
        .toLowerCase(),
    ),
    password: z.optional(
      z
        .string()
        .trim()
        .min(6, 'Please enter a password with 6 or more characters.'),
    ),
    newPassword: z.optional(
      z
        .string()
        .trim()
        .min(6, 'Please enter a password with 6 or more characters.'),
    ),
  })
  .refine(
    data => {
      if (data.password && !data.newPassword) {
        return false
      }

      return true
    },
    {
      message: 'New password is required!',
      path: ['newPassword'],
    },
  )
  .refine(
    data => {
      if (data.newPassword && !data.password) {
        return false
      }

      return true
    },
    {
      message: 'Password is required!',
      path: ['password'],
    },
  )

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .min(6, 'Please enter a password with 6 or more characters.'),
})

export const ResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .toLowerCase(),
})

export const LoginSchema = z.object({
  password: z.string().trim().min(1, 'Please enter your password.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .toLowerCase(),
  code: z.optional(z.string().trim()),
})

export const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .toLowerCase(),
  password: z
    .string()
    .trim()
    .min(6, 'Please enter a password with 6 or more characters.'),
})
