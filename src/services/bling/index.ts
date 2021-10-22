import axios, { AxiosInstance } from 'axios'

import blingConfig from '@/config/bling'

export const blingApi = (apikey: string): AxiosInstance => {
  return axios.create({
    baseURL: blingConfig.baseURL,
    params: {
      apikey,
    },
  })
}
