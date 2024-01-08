import 'reflect-metadata'
import './service/registry/services-registry'
import { ExtensionContext, ViewColumn, commands, window } from 'vscode'
import { ViewProviderSidebar } from './view-provider/view-provider-sidebar'
import { ViewProviderPanel } from './view-provider/view-provider-panel'
import { getControllers } from './controller/registry/controllers-registry'

export function activate(context: ExtensionContext) {
  const { callables, subscribables } = getControllers()
  // sibebar view 实例化
  const viewProvidersidebar = new ViewProviderSidebar(context, { callables, subscribables })
  // 在 views（ sidebar-view-container 已在 package.json 的 contributes 中声明）中注册
  const sidebarViewDisposable = window.registerWebviewViewProvider(
    'sidebar-view-container',
    viewProvidersidebar,
    { webviewOptions: { retainContextWhenHidden: true } }
  )

  // 为指令 panel-view-container.show 注册行为
  const panelViewDisposable = commands.registerCommand('panel-view-container.show', () => {
    const viewProviderPanel = new ViewProviderPanel(context, { callables, subscribables })
    const panel = window.createWebviewPanel(
      'panel-view-container',
      'Panel View',
      ViewColumn.One,
      {}
    )
    viewProviderPanel.resolveWebviewView(panel)
  })

  // subscriptions 列表中的 disposable, 会在插件失活时被执行
  context.subscriptions.push(sidebarViewDisposable, panelViewDisposable)
}

export function deactivate() {}
