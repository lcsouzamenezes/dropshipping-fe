import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Integration {
  id: string
  description: string
  provider: string
}

export async function getIntegrations() {
  const { data } = await api.get<Integration[]>('integrations')

  const integrations = data.map((integration) => {
    return {
      id: integration.id,
      name: integration.description,
      type: integration.provider === 'mercadolivre' ? 'Mercado Livre' : 'Bling',
    }
  })

  return integrations
}

export function useIngrations() {
  return useQuery('integrations', async () => await getIntegrations(), {
    staleTime: 1000 * 60 * 5,
  })
}
