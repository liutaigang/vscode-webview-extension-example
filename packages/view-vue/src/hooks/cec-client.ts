import { CecClient, type MsgObserver } from 'cec-client-server'

const vscodeApi = (window as any).acquireVsCodeApi()
const cecClient = new CecClient(vscodeApi.postMessage, (msgHandler) => {
  window.addEventListener('message', (evt) => {
    msgHandler(evt.data)
  })
})

export const useCecClient = () => cecClient

export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  return cecClient.call<ReplyVal>(name, ...args)
}

export const useSubscrible = (name: string, observer: MsgObserver) => {
  return cecClient.subscrible(name, observer)
}
