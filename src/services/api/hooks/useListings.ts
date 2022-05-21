import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Listing {
  id: string
  code: string
  active: boolean
  created_at: Date
  updated_at: Date
  parent_code: string
  account: {
    id: string
    name: string
    type: 'supplier' | 'seller'
  }
  products: Array<{
    id: string
    updated_at: Date
    created_at: Date
    name: string
    sku: string
    price: number
    stock: number
    ean: string
    images: Array<{
      id: string
      updated_at: Date
      created_at: Date
      url: string
      is_external: boolean
    }>
  }>
  integration: {
    id: string
    provider: string
    description: string
  }
}

interface ListingsFormated {
  id: string
  code: string
  active: boolean
  created_at: Date
  updated_at: Date
  parent_code: string
  account: {
    id: string
    name: string
    type: 'supplier' | 'seller'
  }
  products: Array<{
    id: string
    updated_at: Date
    created_at: Date
    name: string
    sku: string
    price: string
    stock: number
    ean: string
    images: Array<{
      id: string
      updated_at: Date
      created_at: Date
      url: string
      is_external: boolean
    }>
  }>
  integration: {
    id: string
    provider: string
    description: string
  }
}

interface GetListingsResponse {
  listings: ListingsFormated[]
  totalCount: number
}

async function getListings(
  page: number = 1,
  perPage: number = 12
): Promise<GetListingsResponse> {
  const { data, headers } = await api.get<Listing[]>('listings', {
    params: {
      page,
      perPage,
    },
  })

  const totalCount = Number(headers['x-total-count'])

  const listings = data.map(({ products, ...rest }) => {
    const productsMapped = products.map((product) => {
      return {
        ...product,
        price: product.price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        stock: product.stock < 0 ? (0).toFixed(2) : product.stock,
      }
    })
    return {
      ...rest,
      products: productsMapped,
    } as ListingsFormated
  })

  return {
    listings,
    totalCount,
  }
}

export function useListings(page: number, perPage?: number) {
  return useQuery(
    ['listings', page],
    async () => await getListings(page, perPage),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  )
}
