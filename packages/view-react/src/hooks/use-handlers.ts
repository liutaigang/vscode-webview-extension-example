import { wrap } from '@jsonrpc-rx/client'
import { useJsonrpcClient } from './use-jsonrpc-client'
import { HandlersType } from 'extension/handlers-type'

export const useHandlers = () => {
  const jsonrpcClient = useJsonrpcClient()
  return wrap<HandlersType>(jsonrpcClient)
}
