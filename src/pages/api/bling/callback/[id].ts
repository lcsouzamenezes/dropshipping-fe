import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  data: string
}

interface ParsedData {
  retorno: {
    estoque: [
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

export default function handle(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { id } = request.query

    const body = request.body as RequestBody
    const data = JSON.parse(body.data)
    console.log()

    return response.status(200).end()
  }

  return response.status(404).end()
}
