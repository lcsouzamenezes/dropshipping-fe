import { parseCookies } from 'nookies'
import { ReactNode, useEffect, useState } from 'react'
import { createContext, useContext } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

type SocketContextData = {
  socket?: any
  isConnected: boolean
}

type SocketProviderProps = {
  children: ReactNode
}

const SocketContext = createContext<SocketContextData>(undefined)

const SocketProvider = ({ children }: SocketProviderProps) => {
  let socket: Socket = undefined
  const { isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const { '@dropShipping.token': token } = parseCookies()
      socket = io(process.env.NEXT_PUBLIC_API_HOST, {
        auth: {
          token,
        },
      })
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

const useSocket = () => useContext(SocketContext)

export { SocketProvider, useSocket }
