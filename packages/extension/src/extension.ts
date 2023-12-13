import * as vscode from 'vscode'
import { ViewProviderSidebar } from './service/view-provider/view-provider-sidebar'
import { ViewProviderPanel } from './service/view-provider/view-provider-panel'

export function activate(context: vscode.ExtensionContext) {
  const viewProvidersidebar = new ViewProviderSidebar(context)
  const sidebarViewDisposable = vscode.window.registerWebviewViewProvider(
    'sidebar-view-container',
    viewProvidersidebar,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  )
  const panelViewDisposable = vscode.commands.registerCommand('panel-view-container.show', () => {
    const viewProviderPanel = new ViewProviderPanel(context)
    const panel = vscode.window.createWebviewPanel(
      'panel-view-container',
      'Panel View',
      vscode.ViewColumn.One,
      {}
    )
    viewProviderPanel.resolveWebviewView(panel)
  })
  context.subscriptions.push(sidebarViewDisposable, panelViewDisposable)
}

export function deactivate() {}
