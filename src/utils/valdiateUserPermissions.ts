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
  if (user.roles.includes('master')) {
    return true
  }

  if (permissions?.length) {
    const hasAllPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission)
    })

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length) {
    const hasAllRoles = roles.some((permission) => {
      return user.roles.includes(permission)
    })

    if (!hasAllRoles) {
      return false
    }
  }
  return true
}
