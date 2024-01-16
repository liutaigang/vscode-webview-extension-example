import { ExtensionContext, Uri, Webview, WebviewPanel, WebviewView } from 'vscode'
import { readFileSync } from 'fs'
import { join } from 'path'
import { modifyHtml } from 'html-modifier'
import { CallHandler, CecServer, SubscribleHandler } from 'cec-client-server'

export type ViewProviderOptions = {
  distDir: string
  indexPath: string
}

export type ControllerOptions = {
  callables: { [name: string]: CallHandler }
  subscribables: { [name: string]: SubscribleHandler }
}

export abstract class AbstractViewProvider {
  // 这个是在前端应用插入代码的标识，用于在 index.html 文件适应的位置插入内容
  static WEBVIEW_INJECT_IN_MARK = '__webview_public_path__'

  /**
   * 构造方法
   * @param context 该插件的上下文，在插件激活时可以获取
   * @param controllerOptions
   * @param wiewProviderOptions 相关配置
   */
  constructor(
    protected context: ExtensionContext,
    protected controllerOptions: ControllerOptions,
    protected wiewProviderOptions: ViewProviderOptions
  ) {}

  /**
   * 用于实现 webviewView 的处理逻辑，例如：html 赋值、通讯、设置 webviewView 参数等
   * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
   */
  abstract resolveWebviewView(webviewView: WebviewView | WebviewPanel): void

  /**
   * 新增一个 CecServer 实例，并设置相关的 callable 和 subscribable
   * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
   */
  protected setControllers(webview: Webview) {
    const cecServer = new CecServer(
      webview.postMessage.bind(webview),
      webview.onDidReceiveMessage.bind(webview)
    )
    const { callables, subscribables } = this.controllerOptions
    Object.entries(callables).map((item) => cecServer.onCall(...item))
    Object.entries(subscribables).map((item) => cecServer.onSubscribe(...item))
  }

  /**
   * 处理前端应用 index.html 文件的方法
   * @param webview vscode.Webview 类型，指向 vscode.WebviewView 的一个属性：webview
   * @returns 处理好的 index.html 文本内容
   */
  protected async getWebviewHtml(webview: Webview) {
    const { distDir, indexPath } = this.wiewProviderOptions
    // 前端应用的打包结果所在的目录，形如：https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue
    const webviewUri = webview
      .asWebviewUri(Uri.joinPath(this.context.extensionUri, distDir))
      .toString()
    // 需要在前端应用中插入的脚本，目的是：将上述 webviewUri 所指的目录告知前端应用，前端应用在定位资源时需要
    const injectInContent = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`

    const htmlPath = join(this.context.extensionPath, indexPath)
    // 读取 index.html 文件内容
    const htmlText = readFileSync(htmlPath).toString()
    // 使用 html-modifier 库来处理读取的内容，主要的作用是：1、将 script、link 标签中的 src、href 的值，重新赋予正确的值，2、将上述 injectInContent 的内容插入读取的内容中
    return await modifyHtml(htmlText, {
      onopentag(name, attribs) {
        if (name === 'script') attribs.src = join(webviewUri, attribs.src)
        if (name === 'link') attribs.href = join(webviewUri, attribs.href)
        return { name, attribs }
      },
      oncomment(data) {
        const hasMark = data
          ?.toString()
          .toLowerCase()
          .includes(AbstractViewProvider.WEBVIEW_INJECT_IN_MARK)
        return hasMark ? { data: injectInContent, clearComment: true } : { data }
      }
    })
  }
}
