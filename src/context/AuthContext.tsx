import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from '../services/api/apiClient'

type User = {
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

type AuthenticationResponse = {
  user: {
    name: string
    email: string
    roles: string[]
  }
  token: string
  refresh_token: string
}

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void
  user: User
  isRedirecting: boolean
  isAuthenticated: boolean
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function redirectToLogin() {
  Router.push('/')
}

export function signOut(ctx = undefined) {
  destroyCookie(ctx, '@dropShipping.token')
  destroyCookie(ctx, '@dropShipping.refreshToken')

  if (authChannel) authChannel.postMessage('AUTH_SIGNOUT')

  if (process.browser) {
    redirectToLogin()
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'AUTH_SIGNOUT':
          signOut()
          break

        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    const { '@dropShipping.token': token } = parseCookies()

    if (token) {
      api
        .get('/users/me')
        .then((response) => {
          const { me } = response.data
          setUser(me)
        })
        .catch(() => {
          if (process.browser) {
            signOut()
          }
        })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post<AuthenticationResponse>('sessions', {
        email,
        password,
      })

      const { user, token, refresh_token } = response.data

      setCookie(undefined, '@dropShipping.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/',
      })
      setCookie(undefined, '@dropShipping.refreshToken', refresh_token, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/',
      })

      setUser({
        name: user.name,
        email,
        roles: user.roles,
        permissions: [],
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      setIsRedirecting(true)
      await Router.push('/dashboard')
      setIsRedirecting(false)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, isAuthenticated, isRedirecting }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
