# View-vue 的主要模块简介

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
