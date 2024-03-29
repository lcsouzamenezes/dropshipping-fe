import { api } from '@/services/api/apiClient'
import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  data: string
}

interface ParsedData {
  retorno: {
    estoques: [
      {
        estoque: {
          id: string
          codigo: string
          nome: string
          estoqueAtual: number
        }
      }
    ]
  }
}

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    try {
      const { id: integration_id } = request.query

      const body = request.body as RequestBody
      const data = JSON.parse(body.data) as ParsedData

      const estoque = data.retorno.estoques[0].estoque

      await api
        .patch(`callbacks/bling/stock/${integration_id}`, {
          code: estoque.id,
          stock: estoque.estoqueAtual,
        })
        .catch((err) => {
          console.error(err.response.data.message)
        })
    } catch (error) {}

    return response.status(200).end()
  }

  return response.status(404).end()
}
