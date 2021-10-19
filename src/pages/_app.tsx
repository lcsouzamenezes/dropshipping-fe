import { AppProps } from 'next/app'
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClientProvider } from 'react-query'

import { SideBarDrawerProvider } from '../context/SideBarDrawerContext'
import { AuthProvider } from '../context/AuthContext'
import { ChakraProvider } from '../providers/ChakraProvider'
import { makeServer } from '../services/mirage'
import { queryClient } from '../services/queryClient'

// if (process.env.NODE_ENV === 'development') {
//   makeServer({ environment: 'development' })
// }

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <ChakraProvider cookies={pageProps.cookies}>
          <SideBarDrawerProvider>
            <Component {...pageProps} />
          </SideBarDrawerProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}
