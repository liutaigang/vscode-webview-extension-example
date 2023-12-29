import * as vscode from 'vscode'
import { AbstractViewProvider, ControllerOptions } from './view-provider-abstract'
import { CecServer } from 'cec-client-server'
import { Deferred } from '../util/deferred'

export class ViewProviderSidebar
  extends AbstractViewProvider
  implements vscode.WebviewViewProvider
{
  constructor(context: vscode.ExtensionContext, controller: ControllerOptions) {
    super(context, controller, {
      distDir: 'out/view-vue',
      indexPath: 'out/view-vue/index.html'
    })
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
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
