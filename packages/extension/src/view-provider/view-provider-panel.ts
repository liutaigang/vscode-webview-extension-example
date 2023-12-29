import * as vscode from 'vscode'
import { AbstractViewProvider, ControllerOptions } from './view-provider-abstract'
import { CecServer } from 'cec-client-server'

export class ViewProviderPanel extends AbstractViewProvider {
  constructor(context: vscode.ExtensionContext, controller: ControllerOptions) {
    super(context, controller, {
      distDir: 'out/view-react',
      indexPath: 'out/view-react/index.html'
    })
  }

  async resolveWebviewView(webviewView: vscode.WebviewPanel) {
    const { webview } = webviewView
    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    }

    const cecServer = new CecServer(
      webview.postMessage.bind(webview),
      webview.onDidReceiveMessage.bind(webview)
    )
    const { callables, subscribables } = this.controller
    Object.entries(callables).map((item) => cecServer.onCall(...item))
    Object.entries(subscribables).map((item) => cecServer.onSubscribe(...item))

    webview.html = await this.getWebviewHtml(webview)
  }
}
