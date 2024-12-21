import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig
} from 'axios'

export class AxiosService
  implements Pick<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'>
{
  private axiosInstance: AxiosInstance
  private createAxiosDefaults: CreateAxiosDefaults = {}
  private requestInterceptor = {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      return config
    },
    onRejected: (error: any) => {
      return Promise.reject(error)
    }
  }
  private responseInterceptor = {
    onFulfilled: (config: AxiosResponse) => {
      return config
    },
    onRejected: (error: any) => {
      return Promise.reject(error)
    }
  }

  constructor() {
    this.axiosInstance = axios.create(this.createAxiosDefaults)
    const { onFulfilled, onRejected } = this.requestInterceptor
    this.axiosInstance.interceptors.request.use(onFulfilled, onRejected)
    const { onFulfilled: onFulfilled01, onRejected: onRejected01 } = this.responseInterceptor
    this.axiosInstance.interceptors.response.use(onFulfilled01, onRejected01)
  }

  get<T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.axiosInstance.get(url, config)
  }

  post<T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }

  put<T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }

  delete<T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.axiosInstance.post(url, config)
  }

  patch<T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }
}
