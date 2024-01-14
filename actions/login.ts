'use server'

import * as z from 'zod'
import { AuthError } from 'next-auth'

import { db } from '@/lib/db'
import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail'
import { generateVerificationToken, generateTwoFactorToken } from '@/lib/tokens'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validateFields = LoginSchema.safeParse(values)

  if (!validateFields.success) {
    return {
      error: 'Invalid fields!',
    }
  }

  const { email, password, code } = validateFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email) {
    return {
      error: 'Email does not exist!',
    }
  }

  if (!existingUser.password) {
    return {
      error: 'Password does not exist! Please login with Social Media!',
    }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    )

    return {
      success: 'Confirmation email sent!',
    }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)

      if (!twoFactorToken) {
        return {
          error: 'Invalid code!',
        }
      }

      if (twoFactorToken.token !== code) {
        return {
          error: 'Invalid code!',
        }
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date()

      if (hasExpired) {
        return {
          error: 'Code has expired!',
        }
      }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      )

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id,
          },
        })
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)

      return {
        twoFactor: true,
      }
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid credentials!',
          }

        default:
          return {
            error: 'Something went wrong!',
          }
      }
    }

    throw error
  }
}
