import { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import io from 'socket.io-client'

type SocketContextData = {
  socket?: any
}

type SocketProviderProps = {
  children: ReactNode
}

const SocketContext = createContext<SocketContextData['socket']>(undefined)

const socket = io('http://localhost:3333', {
  transports: ['websocket'],
  upgrade: false,
})

const SocketProvider = ({ children }: SocketProviderProps) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

const useSocket = () => useContext(SocketContext)

export { SocketProvider, useSocket }
