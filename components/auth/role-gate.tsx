'use client'

import { UserRole } from '@prisma/client'
import { FormError } from '@/components/form-error'
import { useCurrentRole } from '@/hooks/use-current-role'

interface RoleGateProps {
  allowedRoles: UserRole
  children?: React.ReactNode
}

export const RoleGate = ({ allowedRoles, children }: RoleGateProps) => {
  const role = useCurrentRole()

  if (role !== allowedRoles) {
    return <FormError message="You are not authorized to view this content!" />
  }

  return <>{children}</>
}
