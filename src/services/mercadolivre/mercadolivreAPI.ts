import axios, { AxiosError, AxiosInstance } from 'axios'
import meliConfig from '@/config/mercadolivre'

interface MeliAccount {
  description?: string
  token: string
  refresh_token: string
  expires_at: Date
}

class MercadoLivreAPI {
  private client: AxiosInstance
  private apiURL = process.env.ML_API_URL
  private clientID = process.env.NEXT_PUBLIC_ML_APP_ID
  private secretKey = process.env.ML_APP_SECRET
  private account: MeliAccount

  constructor(account: MeliAccount, client?: AxiosInstance) {
    this.account = account

    if (!client) {
      this.client = this.buildClient()
    }
  }

  async refreshToken() {
    try {
      const refreshTokenResponse = await this.client.post(
        `${this.apiURL}/oauth/token?grant_type=refresh_token&client_id=${this.clientID}&client_secret=${this.secretKey}&refresh_token=${this.account.refresh_token}`
      )
      return refreshTokenResponse
    } catch (error) {
      throw new Error('Failed to get refresh token')
    }
  }

  buildClient() {
    const client = axios.create({
      baseURL: meliConfig.apiURL,
      headers: {
        Authorization: 'Bearer ' + this.account.token,
      },
    })

    client.interceptors.request.use(
      (request) => request,
      (error: AxiosError) => {
        console.log(error)
      }
    )
    return client
  }
}

export { MercadoLivreAPI }
