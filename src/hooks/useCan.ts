import { useAuth } from '../context/AuthContext'
import { validateUserHasPermissions } from '../utils/valdiateUserPermissions'

type IUseCanParams = {
  permissions?: string[]
  roles?: string[]
}

export function useCan({ permissions, roles }: IUseCanParams) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return false
  }

  return validateUserHasPermissions(user, { permissions, roles })
}
