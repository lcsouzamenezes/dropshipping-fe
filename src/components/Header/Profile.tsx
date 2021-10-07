import {
  Flex,
  Box,
  Text,
  Avatar,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'
import { RiLogoutBoxLine } from 'react-icons/ri'
import dynamic from 'next/dynamic'
const Menu = dynamic(
  import('@chakra-ui/react').then((chakra) => chakra.Menu),
  { ssr: false }
)

interface ProfileProps {
  showProfileDetails?: boolean
}

export function Profile({ showProfileDetails = true }: ProfileProps) {
  const { user, signOut } = useAuth()

  return (
    <Menu id="profile-menu">
      <MenuButton>
        <Flex align="center">
          {showProfileDetails && (
            <Box mr="4" textAlign="right">
              <Text>Jonathan Bertoldi</Text>
              <Text color="gray.500" fontSize="sm">
                {user?.email}
              </Text>
            </Box>
          )}
          <Avatar
            size="md"
            name="Jonathan Bertoldi"
            src="https://github.com/jayremias.png"
          />
        </Flex>
      </MenuButton>
      <MenuList>
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
