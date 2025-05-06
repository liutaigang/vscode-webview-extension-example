## 特点

- 提供 **Vue、React 示例**，使用 monorepo 的架构风格
- 完善的 WebView 与 Extension **通讯方案**，基于 JSON-RPC 2.0
- WebView 开发支持支持**热更新**

## 使用

1. 初始化

   ```
   git clone git@github.com:liutaigang/vscode-webview-extension-example.git
   cd vscode-webview-extension-example
   pnpm i
   ```

2. 按 F5 启动调试模式
3. 点击 activitybar 上的图标： ![](./assets/activitybar-icon.png)
4. 示例动画
   ![](./assets/usage-example.gif)

## 打包

在 root 目录下：

```bash
pnpm build      # 构建所有项目
pnpm package    # 打包插件
```

打包结果：packages/extension/extension-1.0.1.vsix

## 模块简介

- [extension 模块](./packages/extension/README.md)
- [view-react 模块](./packages/view-react/README.md)
- [view-vue 模块](./packages/view-vue/README.md)
