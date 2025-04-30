import { ExtensionContext, ViewColumn, commands, window } from 'vscode';
import { ViewProviderSidebar } from './view-provider/view-provider-sidebar';
import { ViewProviderPanel } from './view-provider/view-provider-panel';
import { getHandlers } from './handlers';

export function activate(context: ExtensionContext) {
  const handlers = getHandlers(context);
  const viewProvidersidebar = new ViewProviderSidebar(context, handlers);
  // 注册 Sidebar
  const sidebarViewDisposable = window.registerWebviewViewProvider('sidebar-view-container', viewProvidersidebar, {
    webviewOptions: { retainContextWhenHidden: true }
  });

  // 注册指令 'panel-view-container.show'，在指令被激活时，显示 panel
  const panelViewDisposable = commands.registerCommand('panel-view-container.show', () => {
    const viewProviderPanel = new ViewProviderPanel(context, handlers);
    const panel = window.createWebviewPanel('panel-view-container', 'Panel View', ViewColumn.One, {
      retainContextWhenHidden: true
    });
    viewProviderPanel.resolveWebviewView(panel);
  });

  context.subscriptions.push(sidebarViewDisposable, panelViewDisposable);
}

export function deactivate() {}
