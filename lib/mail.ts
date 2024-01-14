import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`

  await resend.emails.send({
    to: email,
    subject: 'Confirm your email',
    from: 'noreply@matratecnologia.com',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email</p>`,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await resend.emails.send({
    to: email,
    subject: 'Reset your password',
    from: 'noreply@matratecnologia.com',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    to: email,
    subject: '2FA Code',
    from: 'noreply@matratecnologia.com',
    html: `<p>Your two factor token is: ${token}</p>`,
  })
}
