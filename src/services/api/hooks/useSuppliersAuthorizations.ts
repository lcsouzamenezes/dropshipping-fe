import { useQuery } from 'react-query'
import { api } from '../apiClient'

export interface SupplierAuthorizations {
  id: string
  account: {
    id: string
    name: string
    type: string
    user: {
      name: string
      email: string
    }
    profile: {
      name: string
      nickname: string
      document_number: string
      city_subscription_number: string
      state_subscription_number: string
      is_company: boolean
      created_at: Date
      updated_at: Date
      mobile_number: string
      address: {
        id: string
        address: string
        address_2: string
        city: string
        district: string
        identifier: string
        number: string
        state: string
        zip: string
      }
    }
  }
  supplier: {
    id: string
    name: string
    type: string
  }
  created_at: string
  authorized: boolean
}

async function getSuppliersAuthorizations(
  page?: number,
  perPage?: number
): Promise<SupplierAuthorizations[]> {
  const { data } = await api.get<SupplierAuthorizations[]>(
    'suppliers/authotization-requests',
    { params: { page, perPage } }
  )

  const formatedData = data.map((authorization) => {
    return {
      ...authorization,
      created_at: new Date(authorization.created_at).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      ),
    }
  })

  return formatedData
}

export function useSuppliersAuthorizations(page?: number, perPage?: number) {
  return useQuery(
    ['suppliersAuthorizations'],
    async () => await getSuppliersAuthorizations(page, perPage),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  )
}
