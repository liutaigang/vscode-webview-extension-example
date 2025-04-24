## 使用
- 初始化
  ```
  git clone git@github.com:liutaigang/vscode-webview-extension-example.git
  cd vscode-webview-extension-example
  pnpm i
  ```
- 按 F5 启动调试模式
- 点击 activitybar 上的图标： ![](./assets/activitybar-icon.png)

## 动画
![](./assets/usage-example.gif)

## 打包
```bash
pnpm build      # 构建所有项目
pnpm package    # 打包插件
```
打包结果目录：packages/extension/extension-1.0.1.vsix
