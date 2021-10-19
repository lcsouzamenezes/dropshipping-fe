import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

import blingConfig from '@/config/bling'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { apikey } = request.body
    try {
      await axios.get(`${blingConfig.baseURL}/produtos/json`, {
        params: {
          apikey,
        },
      })
      return response.status(200).end()
    } catch (error) {
      return response.status(error.response.status).end()
    }
  }

  return response.status(404).end()
}
