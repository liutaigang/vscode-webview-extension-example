import { CecClient, type MsgObserver, type MsgReceiver, type MsgSender } from 'cec-client-server'

const vscodeApi = (window as any).acquireVsCodeApi()

const msgSender: MsgSender = vscodeApi.postMessage.bind(vscodeApi)
const msgReceiver: MsgReceiver = (msgHandler) => {
  window.addEventListener('message', (evt) => msgHandler(evt.data))
}
const cecClient = new CecClient(msgSender, msgReceiver)

export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  return cecClient.call<ReplyVal>(name, ...args)
}

export const useSubscrible = (name: string, observer: MsgObserver, ...args: any[]) => {
  return cecClient.subscrible(name, observer, ...args)
}
