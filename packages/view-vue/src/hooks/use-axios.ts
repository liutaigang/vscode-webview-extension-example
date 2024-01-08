import { type AxiosRequestConfig } from 'axios'
import { useCall } from './use-cec-client'

export function useAxios() {
  const get = (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return useCall('Axios.get', url, config)
  }

  const post = (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
    return useCall('Axios.post', url, data, config)
  }

  const put = (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
    return useCall('Axios.put', url, data, config)
  }

  const axiosDelete = (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return useCall('Axios.delete', url, config)
  }

  return {
    get,
    post,
    put,
    axiosDelete
  }
}
