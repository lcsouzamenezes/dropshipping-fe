import { api } from '@/services/api/apiClient'
import {
  Box,
  Icon,
  Heading,
  Text,
  Stack,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  IconButton,
  Spinner,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useSocket } from 'context/NotificationsContext'
import { useEffect, useState } from 'react'
import { RiNotificationLine } from 'react-icons/ri'
import { useNotification } from '@/services/api/hooks/useNotifications'
import { Notification } from '@/services/api/hooks/useNotifications'
import { queryClient } from '@/services/queryClient'
import { useMutation } from 'react-query'

const Popover = dynamic(
  import('@chakra-ui/react').then((chakra) => chakra.Popover),
  {
    ssr: false,
  }
)

export function NotificationsNav() {
  const [hasUnread, setHasUnread] = useState(false)
  const { isFetching, isLoading, data, error, refetch } = useNotification()
  const { socket, isConnected } = useSocket()

  const setRead = useMutation(
    async (id: string) => {
      const response = await api.post('/notifications', {
        id,
      })
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
      },
    }
  )

  async function handleUnreadClick(notification: Notification) {
    await setRead.mutateAsync(notification.id)
  }

  function renderNotification(notifications: Notification[]) {
    if (notifications.length == 0) {
      return (
        <Box p={2}>
          <Text fontWeight="light">😴 Nenhum notificação por aqui.</Text>
        </Box>
      )
    }

    return notifications.map((notification) => (
      <Box
        key={notification.id}
        position="relative"
        p={4}
        borderBottomWidth="1px"
      >
        {!notification.read_at && (
          <Icon
            onClick={() => {
              handleUnreadClick(notification)
            }}
            position="absolute"
            cursor="pointer"
            color="blue.500"
            top={2}
            right={2}
            viewBox="0 0 200 200"
            zIndex={5}
          >
            <path
              fill="currentColor"
              d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            />
          </Icon>
        )}
        <Heading size="sm" pb={1}>
          {notification.title}
        </Heading>
        <Text fontSize={14}>{notification.data}</Text>
      </Box>
    ))
  }

  return (
    <Box position="relative">
      {!isFetching && !error && data.hasUnread && (
        <Icon
          position="absolute"
          color="blue.500"
          top={1}
          right={1}
          viewBox="0 0 200 200"
          zIndex={5}
        >
          <path
            fill="currentColor"
            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
          />
        </Icon>
      )}
      <Popover placement="bottom" onOpen={refetch}>
        <PopoverTrigger>
          <IconButton
            variant="unstyled"
            aria-label="Notificações"
            icon={<Icon as={RiNotificationLine} fontSize="20" />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader align="center">Notificações</PopoverHeader>
          <PopoverBody p="0" textAlign="center">
            {isLoading ? (
              <Spinner m={4} color="brand.500" />
            ) : error ? (
              'erro'
            ) : (
              <Stack maxHeight="50vh" overflow="auto" spacing={0}>
                {renderNotification(data.notifications)}
              </Stack>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}
