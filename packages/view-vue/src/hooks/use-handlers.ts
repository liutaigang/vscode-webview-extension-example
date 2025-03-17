import { JsonrpcClient, wrap, type MessageReceiver, type MessageSender } from '@jsonrpc-rx/client';
import { type HandlersType } from 'extension/handlers-type';

const vscodeApi = (window as any).acquireVsCodeApi();

const msgSender: MessageSender = vscodeApi.postMessage.bind(vscodeApi);
const msgReceiver: MessageReceiver = (handler) => window.addEventListener('message', (evt) => handler(evt.data));

const jsonrpcClient = new JsonrpcClient(msgSender, msgReceiver);

export const useHandlers = () => wrap<HandlersType>(jsonrpcClient);
// export const useHandlers = () => wrap<any>(jsonrpcClient);
