import type { NextApiRequest, NextApiResponse } from 'next'
import meliConfig from '@/config/mercadolivre'

import { api } from '@/services/api/apiClient'

interface IRequest {
  code: string
}

export interface AuthorizationResponse {
  description: string
  access_token: string
  token_type: string
  expires_in: Number
  scope: string
  user_id: Number
  refresh_token: string
}

interface MeMLResponse {
  nickname: string
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<AuthorizationResponse>
) {
  if (request.method === 'POST') {
    const { code } = request.body as IRequest

    const data = {
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_ML_APP_ID,
      client_secret: process.env.ML_APP_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_HOST}/integrations/mercadolivre`,
    }

    try {
      const meliResponse = await api.post<
        Omit<AuthorizationResponse, 'description'>
      >(meliConfig.tokenURL, data)

      const {
        access_token,
        expires_in,
        refresh_token,
        scope,
        token_type,
        user_id,
      } = meliResponse.data

      const meResponse = await api.get<MeMLResponse>(
        `${meliConfig.apiURL}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${meliResponse.data.access_token}`,
          },
        }
      )

      const { nickname: description } = meResponse.data

      return response.status(meliResponse.status).json({
        access_token,
        expires_in,
        refresh_token,
        scope,
        token_type,
        user_id,
        description,
      })
    } catch (error) {
      if (error.response) {
        return response.status(error.response.status).json(error.response.data)
      } else {
        return response.status(500).end()
      }
    }
  }
  return response.status(404).end()
}
