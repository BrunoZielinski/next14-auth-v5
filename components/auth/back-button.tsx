'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href: string
  label: string
}

export const BackButton = ({ href, label }: BackButtonProps) => {
  return (
    <Button asChild size="sm" variant="link" className="font-normal w-full">
      <Link href={href}>{label}</Link>
    </Button>
  )
}
