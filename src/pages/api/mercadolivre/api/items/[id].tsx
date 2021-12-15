import { setupAPIClient } from '@/services/api/api'
import { MercadoLivreAPI } from '@/services/mercadolivre/mercadolivreAPI'
import axios, { AxiosError } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  mercadoLivreId: string
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> {
  if (request.method === 'POST') {
    const api = setupAPIClient({ req: request })
    const { mercadoLivreId } = request.body as RequestBody
    const { id } = request.query

    const { data: mercadolivreAccount } = await api.get(
      `integrations/${mercadoLivreId}`
    )
    console.log(mercadolivreAccount)
    const meliApi = new MercadoLivreAPI(mercadolivreAccount)
    try {
      const { data: getItemData } = await meliApi.getItem(`MLB${id}`)
      console.log(mercadolivreAccount.user_id, getItemData.seller_id)
      if (getItemData.seller_id != mercadolivreAccount.user_id) {
        return response.status(404).json({
          status: false,
          code: 'item:invalid_account',
          message: "Item don't belong to user",
        })
      }
      return response.json({
        status: true,
        code: 'success',
        item: getItemData,
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return response.status(404).json({
          status: false,
          code: 'ml_response:item_not_found',
          message: 'Item not found',
        })
      }
      return response.status(500).json({
        status: false,
        code: 'error:request_failed',
        message: 'Failed to get data',
      })
    }
  }
}
