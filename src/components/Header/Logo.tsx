import { Flex, Image, useBreakpointValue, useColorMode } from '@chakra-ui/react'

export function Logo() {
  const isWideVersion = useBreakpointValue({ base: false, lg: true })
  const { colorMode } = useColorMode()

  return (
    <Flex>
      {isWideVersion ? (
        <Image
          src={
            colorMode === 'light'
              ? '/assets/logo/logo.svg'
              : '/assets/logo/logo-i.svg'
          }
          h="8"
        />
      ) : (
        <Image
          src={
            colorMode === 'light'
              ? '/assets/logo/simbol.svg'
              : '/assets/logo/simbol-i.svg'
          }
          h="10"
        />
      )}
    </Flex>
  )
}
