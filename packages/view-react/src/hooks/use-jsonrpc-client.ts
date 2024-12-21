import { useContext } from 'react'
import { JsonrpcClientContext } from '../contexts/jsonrpc-rx-context'

export const useJsonrpcClient = () => {
  const jsonrpcClient = useContext(JsonrpcClientContext)
  if (jsonrpcClient === undefined) {
    throw new Error('useJsonrpcClient must be used within a JsonrpcClientContextProvider')
  }
  return jsonrpcClient
}
