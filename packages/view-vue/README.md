# View-vue 模块

## 简介

View-vue 模块在这个示例中，作为 Sidebar 来显示，其运行在一个 iframe 下（在 vscode 视图插件开发中，一般称为 Webview）。其运行受到了诸多限制，包括但不限于：跨域问题、资源地址问题等。

View-vue 模块可以与 Extension 模块通讯，通过自研的通讯框架：[jsonrpc-rx-js](https://github.com/jsonrpc-rx/jsonrpc-rx-js)，这可使得 View-vue 模块的能力得到巨大的扩展。

## 详情

```
view-vue/
├── src/
│   ├── hooks/
│   │   ├── use-handlers.ts                     # 建立与 extension 的通讯，并提供使用 handlers（extenson 中定义的） 的能力
│   │   ├── use-messsage.ts                     # 提供与其他 webview 通讯的能力
│   │   ├── use-on-did-open-text-documentts     # 监控工作空间中文件的打开
│   │   └── use-vsc-theme.ts                    # 监控和修改 vscode 的风格主题
│   ├── utils/
│   │   └── join-webview-uri.ts                 # 拼接 webviewUri，一般用于图片等静态资源
│   ├── App.vue                                 # 示例的主要代码实现
│   └── main.ts                                 # 项目入口
└── vite.config.ts                              # 主要关注下，使用了 vite-plugin-vscode-webview-hmr 插件实现开发热更新
```

```

```
