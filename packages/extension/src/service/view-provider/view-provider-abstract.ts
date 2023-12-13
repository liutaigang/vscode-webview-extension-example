import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { modifyHtml } from 'html-modifier'

export abstract class AbstractViewProvider {
  static WEBVIEW_INJECT_IN_MARK = '__webview_public_path__'

  constructor(
    protected context: vscode.ExtensionContext,
    protected options: {
      appDir: string
      indexPath: string
    }
  ) {}

  abstract resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel): void

  protected async getWebviewHtml(webview: vscode.Webview) {
    const { appDir, indexPath } = this.options
    const webviewUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, appDir))
      .toString()

    const WEBVIEW_INJECT_IN_CONTENT = `
      <script>
        window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"
      </script>
    `

    const htmlPath = path.join(this.context.extensionPath, indexPath)
    const htmlText = fs.readFileSync(htmlPath).toString()
    const newHtmlText = await modifyHtml(htmlText, {
      onopentag(name, attribs) {
        if (name === 'script') {
          attribs.src = path.join(webviewUri, attribs.src)
        }
        if (name === 'link') {
          attribs.href = path.join(webviewUri, attribs.href)
        }
        return { name, attribs }
      },
      oncomment(data) {
        return data?.toString().toLowerCase().includes(AbstractViewProvider.WEBVIEW_INJECT_IN_MARK)
          ? { data: WEBVIEW_INJECT_IN_CONTENT, clearComment: true }
          : { data }
      }
    })
    return newHtmlText
  }
}
