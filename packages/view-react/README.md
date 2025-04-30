# View-react 模块

## 简介

View-react 模块在这个示例中，作为 Panel 来显示，其运行在一个 iframe 下（在 vscode 视图插件开发中，一般称为 Webview）。其运行受到了诸多限制，包括但不限于：跨域问题、资源地址问题等。

View-react 模块可以与 Extension 模块通讯，通过自研的通讯框架：[jsonrpc-rx-js](https://github.com/jsonrpc-rx/jsonrpc-rx-js)，这可使得 View-react 模块的能力得到巨大的扩展。

## 详情

```
view-react/
├── src/
│   ├── contexts/
│   │   └── jsonrpc-rx-context.ts              # 建立与 extension 之间的通讯，并提供相关的上下文
│   ├── hooks/
│   │   ├── use-handlers.ts                    # 提供使用 handlers（extenson 中定义的） 的能力
│   │   ├── use-message.ts                     # 提供与其他 webview 通讯的能力
│   │   ├── use-on-did-open-text-documentts    # 监控工作空间中文件的打开
│   │   └── use-vsc-theme.ts                   # 监控和修改 vscode 的风格主题
│   ├── utils/
│   │   └── join-webview-uri.ts                # 将 webviewUri 拼接与当前路径进行拼接
│   ├── App.tsx                                # 示例的主要代码实现
│   └── main.tsx                               # 项目入口
└── vite.config.ts                             # 主要关注下使用了 vite-plugin-vscode-webview-hmr 插件实现开发热更新
```
