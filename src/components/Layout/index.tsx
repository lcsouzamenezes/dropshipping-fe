import { ReactChildren } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Box, Flex } from '@chakra-ui/react'

type LayoutProps = {
  children: ReactChildren
}

export default function Layout({ children }) {
  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        {children}
      </Flex>
    </Box>
  )
}
