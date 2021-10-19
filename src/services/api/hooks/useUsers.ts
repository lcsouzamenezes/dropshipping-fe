import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface User {
  id: string
  name: string
  email: string
  created_at: Date
}

interface UserFormated extends Omit<User, 'created_at'> {
  createdAt: string
}

interface GetUsersResponse {
  users: UserFormated[]
  totalCount: number
}

export async function getUsers(
  page: number,
  perPage: number = 10
): Promise<GetUsersResponse> {
  const { data, headers } = await api.get('users', {
    params: {
      page,
      perPage,
    },
  })

  const totalCount = Number(headers['x-total-count'])

  const users = data.users.map((user: User) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: new Date(user.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    }
  })

  return {
    users,
    totalCount,
  }
}

export function useUsers(page: number) {
  return useQuery(['users', page], async () => await getUsers(page), {
    staleTime: 1000 * 60 * 5, //5 minutes
  })
}
