import { JsonrpcClient, MessageReceiver, MessageSender } from '@jsonrpc-rx/client'
import { createContext } from 'react'

const vscodeApi = (window as any).acquireVsCodeApi()
const msgSender: MessageSender = vscodeApi.postMessage.bind(vscodeApi)
const msgReceiver: MessageReceiver = (handler) => window.addEventListener('message', (e) => handler(e.data))
const jsonrpcClient = new JsonrpcClient(msgSender, msgReceiver)

export const JsonrpcClientContext = createContext<JsonrpcClient>(jsonrpcClient)

export const JsonrpcClientContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <JsonrpcClientContext.Provider value={jsonrpcClient}>{children}</JsonrpcClientContext.Provider>
}
