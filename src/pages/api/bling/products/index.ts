import { NextApiRequest, NextApiResponse } from 'next'
import { blingApi } from '@/services/bling'

interface RequestBody {
  blingApiKey: string
  sku: string
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { blingApiKey, sku } = request.body as RequestBody

    const api = blingApi(blingApiKey)

    const {
      data: { retorno },
    } = await api.get(`produto/${sku}/json`, {
      params: {
        estoque: 'S',
        imagem: 'S',
      },
    })

    if (retorno?.erros) {
      const { erros: errors } = retorno
      if (errors[0].erro.cod == 14) {
        response.statusMessage = 'SKU not found'
        return response.status(404).end()
      }
    }

    const { produto } = retorno.produtos[0]

    return response.json(produto)
  }

  return response.status(404).end()
}
