import { CallHandler } from 'cec-client-server'
import { window } from 'vscode'

export const callables = {
  getSum: (...args: number[]) => {
    return args.reduce((sum, next) => (sum += next))
  },
  getTheme: () => {
    return window.activeColorTheme.kind
  }
} as { [key: string]: CallHandler }
