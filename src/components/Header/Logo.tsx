import { useBreakpointValue } from '@chakra-ui/react'
import { Flex, Image } from '@chakra-ui/react'

export function Logo() {
  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  return (
    <Flex align="center" justify="center">
      {isWideVersion && <Image src="/assets/logo/simbolo.svg" h="10" />}
      <Image src="/assets/logo/tipografia.svg" h="8" ml="4" />
    </Flex>
  )
}
