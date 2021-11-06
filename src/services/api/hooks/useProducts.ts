import { useQuery } from 'react-query'
import { api } from '../apiClient'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface ProductFormated {
  id: string
  name: string
  price: string
  stock: number | string
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
      name: product.name,
      price: product.price.toLocaleString('pt-BR', {
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

export function useProducts(page: number) {
  return useQuery(['products', page], async () => getProducts(page), {
    staleTime: 1000 * 60 * 5, //5 minutes
  })
}
