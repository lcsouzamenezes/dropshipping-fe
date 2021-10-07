import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { redirectToLogin, signOut } from '../../context/AuthContext'
import { AuthTokenError } from '../../errors/AuthTokenError'

let isRefreshingTheToken = false
let failedRequestsQueue = []

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['@dropShipping.token']}`,
    },
  })

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx)

          if (cookies['@dropShipping.refreshToken']) {
            const originalRequestConfig = error.config

            if (!isRefreshingTheToken) {
              isRefreshingTheToken = true
              api
                .post('sessions/refresh', {
                  refresh_token: cookies['@dropShipping.refreshToken'],
                })
                .then((response) => {
                  const { token, refresh_token } = response.data

                  setCookie(ctx, '@dropShipping.token', token, {
                    maxAge: 60 * 60 * 24 * 30, //30 days
                    path: '/',
                  })

                  setCookie(ctx, '@dropShipping.refreshToken', refresh_token, {
                    maxAge: 60 * 60 * 24 * 30, //30 days
                    path: '/',
                  })

                  api.defaults.headers['Authorization'] = `Bearer ${token}`

                  failedRequestsQueue.forEach((request) => {
                    request.resolve(token)
                  })
                  failedRequestsQueue = []
                })
                .catch((error) => {
                  failedRequestsQueue.forEach((request) => {
                    request.reject()
                  })
                  failedRequestsQueue = []
                })
                .finally(() => {
                  isRefreshingTheToken = false
                })
            }
            return new Promise((resolve, reject) => {
              failedRequestsQueue.push({
                resolve: (token: string) => {
                  originalRequestConfig.headers[
                    'Authorization'
                  ] = `Bearer ${token}`
                  resolve(api(originalRequestConfig))
                },
                reject: (err: AxiosError) => {
                  reject(err)
                },
              })
            })
          } else {
            if (process.browser) {
              redirectToLogin()
            } else {
              return Promise.reject(new AuthTokenError())
            }
          }
        } else {
          signOut(ctx)
          return Promise.reject(new AuthTokenError())
        }
      }
      return Promise.reject(error)
    }
  )
  return api
}
