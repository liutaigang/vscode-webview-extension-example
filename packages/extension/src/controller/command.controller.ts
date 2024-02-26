import * as vscode from 'vscode'
import { callable, controller } from 'cec-client-server/decorator'
import { Deferred } from '../util/deferred'

@controller('Command')
export class CommandControler {
  constructor() {}

  @callable()
  exec(command: string, ...rest: any[]) {
    const thenable = vscode.commands.executeCommand(command, ...rest)
    const { promise, reject, resolve } = new Deferred<any>()
    thenable.then(resolve, reject)
    return promise
  }
}
