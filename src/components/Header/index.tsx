import { Flex, useBreakpointValue, IconButton, Icon } from '@chakra-ui/react'
import { Logo } from './Logo'
import { Profile } from './Profile'
import { NotificationsNav } from './NotificationsNav'
import { SearchBox } from './SearchBox'
import { useSideBarDrawer } from '../../context/SideBarDrawerContext'
import { RiMenuLine } from 'react-icons/ri'
import { ColorModeSwitch } from './ColorModeSwitch'

export function Header() {
  const { onOpen } = useSideBarDrawer()
  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  return (
    <Flex
      as="header"
      w="100%"
      maxWidth={1480}
      h="20"
      mx="auto"
      mt="4"
      px="6"
      align="center"
    >
      {!isWideVersion && (
        <IconButton
          aria-label="Open navigation"
          icon={<Icon as={RiMenuLine} />}
          fontSize="24"
          variant="unstyled"
          onClick={onOpen}
          mr="2"
          data-testid="open-nav-button"
        />
      )}
      <Logo />

      {isWideVersion && <SearchBox />}

      <Flex align="center" ml="auto">
        <NotificationsNav />
        <ColorModeSwitch />

        <Profile showProfileDetails={isWideVersion} />
      </Flex>
    </Flex>
  )
}
