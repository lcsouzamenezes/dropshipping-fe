import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Product {
  id: string
  ean: string
  sku: string
  name: string
  price: number
  stock: number
  account: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    is_external: boolean
  }>
  created_at: Date
  updated_at: Date
}

export interface ProductFormated {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
  created_at: Date
  updated_at: Date
  supplier: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    is_external: boolean
  }>
}

interface GetCatalogResponse {
  products: ProductFormated[]
  totalCount: number
}

const getCatalog = async (
  page: number,
  perPage: number = 12,
  search: string,
  supplier: string
): Promise<GetCatalogResponse> => {
  const { headers, data } = await api.get<Product[]>('catalog', {
    params: {
      page,
      perPage,
      search,
      supplier,
    },
  })

  const totalCount = Number(headers['x-total-count'])

  const products = data.map((product) => {
    return {
      id: product.id,
      sku: product.sku,
      ean: product.ean,
      name: product.name,
      price: product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),

      stock: product.stock < 0 ? (0).toFixed(2) : product.stock,
      supplier: {
        id: product.account.id,
        name: product.account.name,
      },
      created_at: product.created_at,
      updated_at: product.updated_at,
      images: product.images.map((image) => ({
        id: image.id,
        is_external: image.is_external,
        url: image.url,
      })),
    } as ProductFormated
  })

  return {
    products,
    totalCount,
  }
}

export function useCatalog(
  page: number,
  perPage?: number,
  search?: string,
  supplier?: string
) {
  return useQuery(
    ['catalog', page, search, supplier],
    async () => getCatalog(page, perPage, search, supplier),
    {
      staleTime: 1000 * 60 * 5, //5 minute
    }
  )
}
