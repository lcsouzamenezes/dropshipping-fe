type User = {
  permissions?: string[]
  roles: string[]
}

type Permissions = {
  permissions?: string[]
  roles?: string[]
}

export function validateUserHasPermissions(
  user: Pick<User, 'permissions' | 'roles'>,
  { permissions, roles }: Permissions
) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission)
    })

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.some((permission) => {
      return user.roles.includes(permission)
    })

    if (!hasAllRoles) {
      return false
    }
  }
  return true
}
