import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Integration {
  id: string
  description: string
  provider: string
}

export async function getIntegrations(type?: string) {
  const { data } = await api.get<Integration[]>('integrations', {
    params: {
      type,
    },
  })

  const integrations = data.map((integration) => {
    return {
      id: integration.id,
      name: integration.description,
      type: integration.provider === 'mercadolivre' ? 'Mercado Livre' : 'Bling',
    }
  })

  return integrations
}

export function useIngrations(type?: string) {
  return useQuery(
    ['integrations', type],
    async () => await getIntegrations(type),
    {
      staleTime: 1000 * 60 * 5,
    }
  )
}
