import * as vscode from 'vscode'
import { AbstractViewProvider } from './view-provider-abstract'

export class ViewProviderSidebar
  extends AbstractViewProvider
  implements vscode.WebviewViewProvider
{
  constructor(context: vscode.ExtensionContext) {
    super(context, {
      distDir: 'out/view-vue',
      indexPath: 'out/view-vue/index.html'
    })
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    }
    webviewView.webview.onDidReceiveMessage((msg) => {
      console.log(msg)
    })
    webviewView.webview.html = await this.getWebviewHtml(webviewView.webview)
  }
}
