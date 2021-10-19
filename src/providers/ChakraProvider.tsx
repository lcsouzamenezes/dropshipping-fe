import {
  ChakraProvider as OriginalChakraProvider,
  cookieStorageManager,
  localStorageManager,
} from '@chakra-ui/react'
import { NextPageContext } from 'next'

import { theme } from '../styles/theme'

export function ChakraProvider({ cookies, children }) {
  let colorModeMananger =
    typeof cookies === 'string'
      ? cookieStorageManager(cookies)
      : localStorageManager

  return (
    <OriginalChakraProvider theme={theme} colorModeManager={colorModeMananger}>
      {children}
    </OriginalChakraProvider>
  )
}

export function getServerSideProps({ req }) {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
