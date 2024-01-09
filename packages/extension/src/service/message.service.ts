import { service } from 'cec-client-server/decorator'

export interface MessageSubject {
  register(subjectMame: string, observer: (message: any) => void): void
  send(subjectMame: string, message: any): Promise<any>
}

@service()
export class MessageService implements MessageSubject {
  private subjectObserverMap = new Map<string, (message: any) => void>()

  register(subjectMame: string, observer: (message: any) => void) {
    this.subjectObserverMap.set(subjectMame, observer)
  }

  send(subjectMame: string, message: any) {
    if (!this.subjectObserverMap.has(subjectMame)) {
      return Promise.reject(`The message subject: ${subjectMame} is not exist !`)
    }
    const observer = this.subjectObserverMap.get(subjectMame)!
    observer.call({}, message)
    return Promise.resolve('success')
  }
}
