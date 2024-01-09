import { callable, controller, subscribable, inject } from 'cec-client-server/decorator'
import { MessageSubject } from '../service/message.service'

@controller('Message')
export class MessageControler {
  constructor(@inject('MessageService') private messageService: MessageSubject) {}

  @subscribable()
  register(observer: (value: any) => void, subjectMame: string) {
    return this.messageService.register(subjectMame, observer)
  }

  @callable()
  send(subjectMame: string, message: any) {
    return this.messageService.send(subjectMame, message)
  }
}
