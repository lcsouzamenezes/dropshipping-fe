import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

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
    }),
  },
  colors: {
    brand: {
      50: '#e1ffed',
      100: '#b6fad2',
      200: '#8af4b6',
      300: '#5ef09a',
      400: '#35ec7e',
      500: '#1fd265',
      600: '#15a34e',
      700: '#0b7537',
      800: '#014620',
      900: '#001907',
    },
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
  },
};

export const theme = extendTheme({ config, ...themeDetails });
