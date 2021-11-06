import { useQuery } from 'react-query'
import { api } from '../apiClient'

export interface Notification {
  id: string
  title?: string
  data: string | null
  read_at: Date
  created_at: Date
  type: 'success' | 'info' | 'warning' | 'error' | 'normal'
}

interface GetNotificationsResponse {
  notifications: Notification[]
  hasUnread: boolean
}

async function getNotifications(): Promise<GetNotificationsResponse> {
  const { data } = await api.get<Notification[]>('notifications')
  let hasUnread = false

  data.map((notification) => {
    if (notification.read_at == null) {
      hasUnread = true
    }
    return notification
  })

  return {
    notifications: data,
    hasUnread,
  }
}

export function useNotification() {
  return useQuery('notifications', async () => getNotifications(), {
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
