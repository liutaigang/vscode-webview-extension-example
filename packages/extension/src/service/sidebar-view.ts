import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { modifyHtml } from 'html-modifier'

export class SidebarProvider implements vscode.WebviewViewProvider {
  constructor(private context: vscode.ExtensionContext) {}

  public async resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    }
    webviewView.webview.onDidReceiveMessage((msg) => {
      console.log(msg)
    })
    webviewView.webview.html = await this.getWebviewHtml(webviewView.webview)
  }

  private async getWebviewHtml(webview: vscode.Webview) {
    const webviewUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'out/view-vue'))
      .toString()

    const WEBVIEW_INJECT_IN_MARK = 'webviewinjectin'
    const WEBVIEW_INJECT_IN_CONTENT = `
      <script>
        window.__webview_public_path__ = "${webviewUri}"
      </script>
    `

    const htmlPath = path.join(this.context.extensionPath, 'out/view-vue/index.html')
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
        return data?.toString().toLowerCase().includes(WEBVIEW_INJECT_IN_MARK)
          ? { data: WEBVIEW_INJECT_IN_CONTENT, clearComment: true }
          : { data }
      }
    })
    return newHtmlText
  }
}
