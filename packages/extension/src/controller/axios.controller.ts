import { AxiosRequestConfig } from 'axios'
import { callable, controller } from 'cec-client-server/decorator'
import { AxiosService } from '../service/axios.service'

@controller('Axios')
export class AxiosControler {
  constructor(private axiosService: AxiosService) {}

  @callable()
  get(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.get(url, config)
  }

  @callable()
  post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.post(url, data, config)
  }

  @callable()
  put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.put(url, data, config)
  }

  @callable()
  delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.delete(url, config)
  }
}
