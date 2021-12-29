import { destroyCookie, parseCookies } from 'nookies'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { AuthTokenError } from '../errors/AuthTokenError'
import { validateUserHasPermissions } from './valdiateUserPermissions'
import { setupAPIClient } from '../services/api/api'
import { queryClient } from '../services/queryClient'

type WithSSRAuthOptions = {
  permissions?: string[]
  roles?: string[]
}

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (!cookies['@dropShipping.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
    if (options) {
      try {
        const api = setupAPIClient(ctx)
        const response = await api.get<{
          permissions: string[]
          roles: string[]
        }>('users/me/permissions')
        const userPermissions = response.data

        const userHasPermission = validateUserHasPermissions(
          userPermissions,
          options
        )
        if (!userHasPermission) {
          return {
            notFound: true,
          }
        }
      } catch (error) {}
    }
    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, '@dropShipping.token')
        destroyCookie(ctx, '@dropShipping.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        }
      }
    }
  }
}
