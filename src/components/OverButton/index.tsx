import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'

interface OverButtonProps {
  children: React.ReactElement
  buttons: React.ReactElement
}

export function OverButton({ buttons, children }: OverButtonProps) {
  const [show, setShow] = useState(false)

  return (
    <Box
      position="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <Flex
          position="absolute"
          bottom="2"
          left="50%"
          transform="translateX(-50%)"
        >
          {buttons}
        </Flex>
      )}
    </Box>
  )
}
