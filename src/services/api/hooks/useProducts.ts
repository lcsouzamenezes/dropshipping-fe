import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Product {
  id: string
  ean: string
  sku: string
  name: string
  price: number
  stock: number
}

interface ProductFormated {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
}

interface GetProductsResponse {
  products: ProductFormated[]
  totalCount: number
}

async function getProducts(
  page: number,
  perPage: number = 12
): Promise<GetProductsResponse> {
  const { headers, data } = await api.get<Product[]>('products', {
    params: {
      page,
      perPage,
    },
  })

  const totalCount = Number(headers['x-total-count'])

  const products = data.map((product) => {
    return {
      id: product.id,
      sku: product.sku,
      ean: product.ean,
      name: product.name,
      price: (product.price / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      stock: product.stock < 0 ? (0).toFixed(2) : product.stock,
    }
  })

  return {
    products,
    totalCount,
  }
}

export function useProducts(page: number, perPage?: number) {
  return useQuery(['products', page], async () => getProducts(page, perPage), {
    staleTime: 1000 * 60 * 5, //5 minutes
  })
}
