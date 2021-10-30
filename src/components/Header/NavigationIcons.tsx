import { HStack } from '@chakra-ui/react'
import { NotificationsNav } from './NotificationsNav'

export function NavigationIcons() {
  return (
    <HStack
      spacing={['6', '8']}
      mx={['6', '8']}
      pr={['6', '8']}
      py="1"
      borderRightWidth={1}
    >
      <NotificationsNav />
    </HStack>
  )
}
