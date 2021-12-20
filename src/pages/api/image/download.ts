import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { url } = request.body
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
    })
    return response.send(data)
  }

  return response.status(404).end()
}
