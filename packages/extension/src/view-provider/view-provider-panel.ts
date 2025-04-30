import { ExtensionContext, WebviewPanel } from 'vscode';
import { HandlerConfig } from '@jsonrpc-rx/server';
import { AbstractViewProvider } from './view-provider-abstract';

export class ViewProviderPanel extends AbstractViewProvider {
  constructor(context: ExtensionContext, handlers: HandlerConfig) {
    super(context, handlers, {
      distDir: 'out/view-react',
      indexPath: 'out/view-react/index.html',
    });
  }

  async resolveWebviewView(webviewView: WebviewPanel) {
    const { webview } = webviewView;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    this.exposeHandlers(webview);
    webview.html = await this.getWebviewHtml(webview);
  }
}
