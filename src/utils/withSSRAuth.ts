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
      const api = setupAPIClient(ctx)

      const userPermissions = await queryClient.fetchQuery<{
        permissions: string[]
        roles: string[]
      }>(cookies['@dropShipping.token'], async () => {
        const response = await api.get('users/me/permissions')
        return response.data
      })
      const userHasPermission = validateUserHasPermissions(
        userPermissions,
        options
      )
      if (!userHasPermission) {
        return {
          notFound: true,
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        // destroyCookie(ctx, '@dropShipping.token')
        // destroyCookie(ctx, '@dropShipping.refreshToken')
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
