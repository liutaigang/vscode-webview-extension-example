import * as vscode from 'vscode'
import { AbstractViewProvider } from './view-provider-abstract'

export class ViewProviderPanel extends AbstractViewProvider {

  constructor(context: vscode.ExtensionContext) {
    super(context, {
      distDir: 'out/view-react',
      indexPath: 'out/view-react/index.html'
    })
  }

  async resolveWebviewView(webviewView: vscode.WebviewPanel) {
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

