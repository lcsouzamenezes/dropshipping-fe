import { useQuery } from 'react-query'
import { api } from '../apiClient'

export interface Supplier {
  id: string
  name: string
  logo?: string
}

interface GetSuppliersResponse {
  suppliers: Supplier[]
  totalCount: number
}

async function getSuppliers(
  page?: number,
  perPage?: number
): Promise<GetSuppliersResponse> {
  const { data, headers } = await api.get<Supplier[]>('suppliers', {
    params: {
      page,
      perPage,
    },
  })

  const totalCount = Number(headers['x-total-count'])

  const suppliers = data.map(
    (supplier) =>
      ({
        id: supplier.id,
        name: supplier.name,
      } as Supplier)
  )

  return {
    suppliers,
    totalCount: totalCount,
  }
}

export function useSuppliers(page?: number, perPage?: number) {
  return useQuery(
    ['suppliers', page],
    async () => await getSuppliers(page, perPage),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  )
}
