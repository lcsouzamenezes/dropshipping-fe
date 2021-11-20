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
}

interface ProductFormated {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
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

interface getCatalogResponse {
  products: ProductFormated[]
  totalCount: number
}

const getCatalog = async (
  page: number,
  perPage: number = 12
): Promise<getCatalogResponse> => {
  const { headers, data } = await api.get<Product[]>('catalog', {
    params: {
      page,
      perPage,
    },
  })

  console.log(data)

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

export function useCatalog(page: number, perPage?: number) {
  return useQuery(['catalog', page], async () => getCatalog(page, perPage), {
    staleTime: 1000 * 60 * 5, //5 minutes
  })
}
