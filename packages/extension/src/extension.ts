import * as vscode from 'vscode'
import { SidebarProvider } from './service/sidebar-view'

export function activate(context: vscode.ExtensionContext) {
  const readerViewProvider = new SidebarProvider(context)
  const sidebarViewDisposable = vscode.window.registerWebviewViewProvider(
    'sidebar-view-container',
    readerViewProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  )
  context.subscriptions.push(sidebarViewDisposable)
}

export function deactivate() {}
