import { CecClient, type MsgObserver } from 'cec-client-server'

const vscodeApi = (window as any).acquireVsCodeApi()
const cecClient = new CecClient(vscodeApi.postMessage.bind(vscodeApi), (msgHandler) => {
  window.addEventListener('message', (evt) => msgHandler(evt.data))
})

export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  return cecClient.call<ReplyVal>(name, ...args)
}

export const useSubscrible = (name: string, observer: MsgObserver, ...args: any[]) => {
  return cecClient.subscrible(name, observer, ...args)
}
