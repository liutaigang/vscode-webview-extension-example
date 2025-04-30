import { JsonrpcClient, MessageReceiver, MessageSender } from '@jsonrpc-rx/client';
import { createContext } from 'react';

const vscodeApi = (window as any).acquireVsCodeApi();

// 创建消息发送者和接收者
const msgSender: MessageSender = vscodeApi.postMessage.bind(vscodeApi);
const msgReceiver: MessageReceiver = (handler) => window.addEventListener('message', (e) => handler(e.data));

// 初始化一个 Jsonrpc 的“客户端”，与 extension 的“服务端”对应
const jsonrpcClient = new JsonrpcClient(msgSender, msgReceiver);

export const JsonrpcClientContext = createContext<JsonrpcClient>(jsonrpcClient);

export const JsonrpcClientContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <JsonrpcClientContext.Provider value={jsonrpcClient}>{children}</JsonrpcClientContext.Provider>;
};
