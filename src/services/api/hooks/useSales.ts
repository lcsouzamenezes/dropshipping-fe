import { useQuery } from 'react-query'
import { api } from '../apiClient'

type GetSales = Array<{
  id: string
  quantity: number
  account: {
    id: string
    name: string
    type: string
  }
  receipt: string
  label: string
  invoice: string
  listing: {
    id: string
    code: string
    active: true
    product: {
      id: string
      name: string
      sku: string
    }
    integration: {
      id: string
      description: string
      provider: string
    }
  }
}>

export interface SaleFormated {
  id: string
  quantity: number
  receipt: string
  label: string
  invoice: string
  account: {
    id: string
    name: string
    type: string
  }
  listing: {
    id: string
    code: string
    active: true
    product: {
      id: string
      name: string
      sku: string
    }
    integration: {
      id: string
      description: string
      provider: string
    }
  }
}

interface GetSalesResponse {
  sales: SaleFormated[]
  totalCount: number
}

async function getSales(
  page: number,
  perPage: number = 1
): Promise<GetSalesResponse> {
  const { data, headers } = await api.get<GetSales>('sales', {
    params: {
      page,
      perPage,
    },
  })

  const sales = data.map((sale) => {
    return {
      ...sale,
    } as SaleFormated
  })

  const totalCount = Number(headers['x-total-count'])

  return {
    sales: sales,
    totalCount,
  }
}

export function useSales(page: number, perPage?: number) {
  return useQuery(['sales', page, perPage], async () => getSales(page, perPage))
}
