import { NextApiRequest, NextApiResponse } from 'next'

interface IRequestBody {
  resource: string
  user_id: string
  topic: string
  application_id: Number
  attempts: Number
  sent: Date
  received: Date
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    try {
      const { topic, user_id, resource } = request.body as IRequestBody

      switch (topic) {
        case 'orders_v2':
          console.log('testing itens')
          break
        case 'invoices':
          console.log('testing itens')
          break

        default:
          return response.status(200).end()
      }
    } catch (error) {
      console.log(error)
      return response.status(500).end()
    }
  }

  return response.status(404).end()
}
