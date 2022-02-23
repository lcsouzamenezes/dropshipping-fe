import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const themeDetails = {
  styles: {
    global: (props) => ({
      body: {
        color: props.colorMode === 'light' ? 'gray.800' : 'whiteAlpha.900',
      },
      '.panel': {
        bgColor: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
        borderRadius: '8',
      },
      'a.active': {
        color: props.colorMode === 'light' ? 'brand.500' : 'brand.300',
      },
      '&::-webkit-scrollbar': {
        width: '2',
        borderRadius: '8',
        backgroundColor: `rgba(0, 0, 0, 0.05)`,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '8',
        backgroundColor: `rgba(0, 0, 0, 0.1)`,
      },
      '&::-webkit-scrollbar-thumb:hover': {
        borderRadius: '8',
        backgroundColor: `rgba(0, 0, 0, 0.2)`,
      },
    }),
  },
  colors: {
    brand: {
      50: '#e0ecff',
      100: '#b0c6ff',
      200: '#7e9fff',
      300: '#4c79ff',
      400: '#1a53ff',
      500: '#003ae6',
      600: '#002db4',
      700: '#002082',
      800: '#001351',
      900: '#000621',
    },
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
  },
}

export const theme = extendTheme({ config, ...themeDetails })
