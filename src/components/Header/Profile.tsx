import {
  Flex,
  Box,
  Text,
  Avatar,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'
import {
  RiLogoutBoxLine,
  RiProfileLine,
  RiVipCrownFill,
  RiVipCrownLine,
} from 'react-icons/ri'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const Menu = dynamic(
  import('@chakra-ui/react').then((chakra) => chakra.Menu),
  { ssr: false }
)

interface ProfileProps {
  showProfileDetails?: boolean
}

export function Profile({ showProfileDetails = true }: ProfileProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()

  if (!user) {
    return <Spinner color="brand.500" />
  }

  return (
    <Menu id="profile-menu">
      <MenuButton>
        <Flex align="center">
          {showProfileDetails && (
            <Box mr="4" textAlign="right">
              <Flex align="center" justify="flex-end">
                {user.roles?.includes('master') && (
                  <Icon mr={2} color="yellow.500" as={RiVipCrownFill} />
                )}
                <Text>{user.name}</Text>
              </Flex>
              <Text color="gray.500" fontSize="sm">
                {user.email}
              </Text>
            </Box>
          )}
          <Avatar size="md" name={user.name} src={``} />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => router.push('/profile')}
          icon={<Icon as={RiProfileLine} fontSize="18" color="brand.500" />}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={signOut}
          icon={<Icon as={RiLogoutBoxLine} fontSize="18" color="brand.500" />}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
