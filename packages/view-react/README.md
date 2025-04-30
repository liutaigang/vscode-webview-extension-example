# View-react 的主要模块简介

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
