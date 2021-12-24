import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Product {
  id: string
  ean: string
  sku: string
  name: string
  price: number
  stock: number
  active: boolean
}

export interface ProductFormated {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
  active: boolean
}

interface GetProductsResponse {
  products: ProductFormated[]
  totalCount: number
}

async function getProducts(
  page: number,
  perPage: number = 12,
  search?: string
): Promise<GetProductsResponse> {
  const { headers, data } = await api.get<Product[]>('products', {
    params: {
      page,
      perPage,
      search,
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
      active: product.active,
    }
  })

  return {
    products,
    totalCount,
  }
}

export function useProducts(page: number, perPage?: number, search?: string) {
  return useQuery(
    ['products', page, perPage, search],
    async () => getProducts(page, perPage, search),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  )
}
