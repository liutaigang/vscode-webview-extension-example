# extension 模块

## 简介

extension 模块主要的功能是：1、负责加载 Webview，2、处理 Webview 的请求。

extension 运行在 vscode 的插件进程中，运行环境为 node，extension 可以使用 vscode 提供的诸多 API。

## 详情

```
extension/
├── src/
│   ├── handlers/                         # 处理来自 WebView 的请求，包括：调用、通知和订阅
│   ├── service/                          # 服务：给处理器提供服务
│   │   ├── axios.service.ts              # 提供 axios 的网络请求能力
│   │   └── message.service.ts            # 提供 Webview 之间通讯的能力
│   ├── util/                             # 工具集
│   └── view-provider                     # 视图提供者：用于 View 视图的处理、加载和建立 WebView 和 extension 之间的通讯
│   │   ├── view-provider-abstract.ts     # view-provider 的超类，主要是为了提取一些公共的能力
│   │   ├── view-provider-panel.ts        # panel 视图的提供者，主要能力有：1、加载 view-react 的 index.html ，2、处理 index.html 的文本，3、建立 view-react 与 extenson 之间的通讯
│   │   └── view-provider-sidebar.ts      # sidebar 视图的提供者，主要能力有：1、加载 view-vue 的 index.html ，2、处理 index.html 的文本，3、建立 view-vue 与 extenson 之间的通讯
│   └── extension.ts                      # 插件入口，主要作用是初始化 sidebar 和 panel
└── handlers-type.ts                      # 导出 hanlers 的类型
```
