import { SubscribleHandler } from 'cec-client-server'
import { workspace, window } from 'vscode'

export const subscribables = {
  getTheme: (next) => {
    const disposable = workspace.onDidChangeConfiguration(() => {
      next(window.activeColorTheme.kind)
    })
    return disposable.dispose
  }
} as { [key: string]: SubscribleHandler }
