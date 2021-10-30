import { api } from '@/services/api/apiClient'
import {
  Box,
  Icon,
  Heading,
  Text,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  IconButton,
} from '@chakra-ui/react'
import { useSocket } from 'context/NotificationsContext'
import { useEffect, useState } from 'react'
import { RiNotificationLine } from 'react-icons/ri'

interface Notification {
  id: string
  title?: string
  data: string | null
  read_at: Date
  created_at: Date
  type: 'success' | 'info' | 'warning' | 'error' | 'normal'
}

export function NotificationsNav() {
  const [hasUnread, setHasUnread] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { socket, isConnected } = useSocket()

  async function fetchApi() {
    setIsLoading(true)
    const notificationsResponse = await api.get<Notification[]>('notifications')
    setIsLoading(false)
    setNotifications(notificationsResponse.data)
  }

  async function handleUnreadClick(id: string) {
    setNotifications(
      notifications.map((notification) => {
        if (notification.id === id) {
          return {
            ...notification,
            read_at: new Date(),
          }
        }
        return notification
      })
    )
  }

  useEffect(() => {
    fetchApi()
  }, [])

  useEffect(() => {
    setHasUnread(false)
    notifications.map((notification) => {
      if (notification.read_at == null) {
        setHasUnread(true)
      }
    })
  }, [notifications])

  function renderNotification(notification: Notification) {
    return (
      <Box position="relative" p={4} borderBottomWidth="1px">
        {!notification.read_at && (
          <Icon
            onClick={() => {
              handleUnreadClick(notification.id)
            }}
            position="absolute"
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
    )
  }

  return (
    <Box position="relative">
      {hasUnread && (
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
      <Popover placement="bottom">
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
          {notifications && (
            <PopoverBody p="0">
              <Stack spacing={0}>
                {notifications.map((notification) =>
                  renderNotification(notification)
                )}
              </Stack>
            </PopoverBody>
          )}
        </PopoverContent>
      </Popover>
    </Box>
  )
}
