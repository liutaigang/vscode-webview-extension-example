import { workspace } from 'vscode'
import { controller, callable, subscribable } from 'cec-client-server/decorator'

@controller('VscTheme')
export class VscThemeControler {
  constructor() {}

  @callable('getTheme') // 这里使用了别名
  async getThemeForCall() {
    const colorTheme = workspace.getConfiguration().get('workbench.colorTheme')
    return colorTheme
  }

  @subscribable('getTheme')
  getThemeForSubscribe(next: (value: any) => void) {
    const disposable = workspace.onDidChangeConfiguration(() => {
      const colorTheme = workspace.getConfiguration().get('workbench.colorTheme')
      next(colorTheme)
    })
    return disposable.dispose.bind(disposable)
  }

  @callable() // 不使用别名时，callable 的名称就是方法名：updateTheme 本身
  updateTheme(colorTheme: string) {
    workspace.getConfiguration().update('workbench.colorTheme', colorTheme)
  }
}
