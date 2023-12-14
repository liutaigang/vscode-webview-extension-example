[TOC]

# Vscode Webview 使用 Vue 和 React 实现

## 特点

- 完整示例：提供 Vue 和 React 的完整示例
- 解决方案：资源路径、通讯、架构等问题的解决方案一应俱全
- 文档详细：记录每一个踩过的坑
- 拿来即用：高度完善、可运行的示例项目

## 写在前面的

【vscode 的 webview 开发约束】
- webview 应用运行在 iframe 沙盒模式中，有诸多的约束，如：不能请求数据
- 资源路径需要动态的计算: webview 应用的资源路径由 vscode 给定
- 惰性加载几乎不可用：vue 和 react 惰性加载一般不建议使用，不然会比较麻烦 

> 这些问题在下文中都会一一涉及，并会给出相关的解决方案

## 第一步：项目构建
项目采用 monorepo 的范式，使用 pnpm 作为包管理器

### 创建项目工作空间
1. 首先需要安装 pnpm，然后 init 一个项目：

   ```bash
   npm install pnpm -g
   pnpm init
   ```

2. 在 root 目录新建 pnpm-workspace.yaml，内容如下：

   ```yaml
   packages:
     # all packages in direct subdirs of packages/
     - 'packages/*'
   ```
3. 在 root 目录新建 packages 目录，packages 用于放置相互独立的应用（可以单独发布成包）

   ```
   .
   ├── package.json
   ├── packages
   │   └── ...
   ├── pnpm-workspace.yaml
   └── README.md
   ```
### 新建 extension 应用
1. 在 packages 目录下使用 yo 创建 extension 应用

   ```bash
   npm install -g yo generator-code
   yo code
   
        _-----_     ╭──────────────────────────╮
       |       |    │   Welcome to the Visual  │
       |--(o)--|    │   Studio Code Extension  │
      `---------´   │        generator!        │
       ( _´U`_ )    ╰──────────────────────────╯
       /___A___\   /
        |  ~  |
      __'.___.'__
    ´   `  |° ´ Y `
   
   ? What type of extension do you want to create? New Extension (TypeScript)
   ? What's the name of your extension? extension
   ? What's the identifier of your extension? extension
   ? What's the description of your extension? An example for wscode webview developer
   ? Initialize a git repository? Yes
   ? Bundle the source code with webpack? No
   ? Which package manager to use? pnpm
   ```

2. 更改 .vscode 位置
     将 extension 目录中的 .vscode 目录直接移动到 root 目录中，并将其中的 launch.json 的内容做如下的修改：

     ```json
     {
     	"version": "0.2.0",
     	"configurations": [
     		{
     			"name": "Run Extension",
     			"type": "extensionHost",
     			"request": "launch",
     			"args": [
     				"--extensionDevelopmentPath=${workspaceFolder}/packages/extension"
     			],
     			"outFiles": [
     				"${workspaceFolder}/packages/extension/out/**/*.js"
     			],
     			"preLaunchTask": "${defaultBuildTask}"
     		},
     		{
     			"name": "Extension Tests",
     			"type": "extensionHost",
     			"request": "launch",
     			"args": [
     				"--extensionDevelopmentPath=${workspaceFolder}/packages/extension",
     				"--extensionTestsPath=${workspaceFolder}/packages/extension/out/__test__/suite/index"
     			],
     			"outFiles": [
     				"${workspaceFolder}/packages/extension/out/test/**/*.js"
     			],
     			"preLaunchTask": "${defaultBuildTask}"
     		}
     	]
     }
     ```

3. 新增 watch 脚本
    在 extension 中的 package.json 中新增 script：
    
    ```json
    "watch": "tsc -watch -p ./"
    ```
    
      （一般是有的，不用新增）
    
      在 root 目录中的 package.json 中新增 script：
    
    ```json
    "dev": "run-p dev:*",
    "dev:extension": "pnpm run -F extension watch"
    ```

  > 这里，run-p 使用的是 npm-run-all 的命令，`run-p dev:*` 可以并行的调用 `dev:` 开头的脚本

> pnpm -F(--filter) 用于指定 pnpm 要使用的 package, -F(--filter) 后的为包名

### 新建 view-vue 应用

1. 创建应用 view-vue
    在 packages 目录下，执行：
    
    ```
    pnpm create vue@latest
    ```
    
     *注意 Project name 命名*

2. 新增 watch 脚本
    在 view-vue 中的 package.json 中新增 script:
    
    ```json
    "watch-only": "vite build --watch",
    "watch": "run-p type-check \"watch-only {@}\" --"
    ```
    
    （这里是仿照 build 脚本的范式）
    
    在 root 目录中的 package.json 中新增 script：
    
    ```json
    "dev:view-vue": "pnpm run -F view-vue watch"
    ```

3. 修改打包路径
     在 view-vue 的 vite.config.ts 中新增：

     ```js
     build: {
       outDir: '../extension/out/view-vue'
     }
     ```

     将打包的目录指向 extension 的 out/view-vue 目录

### 新建 React 应用

1. 创建应用 view-react
    在 packages 目录下，执行：
    
    ```bash
    pnpm create vite view-react --template react-swc-ts
    ```
    
    （开发者可以选用自己喜欢的打包工具和 template）

2. 新增 watch 脚本
     在 view-react 中的 package.json 中新增 script：

     ```json
     "watch": "vite build --watch"
     ```

     在 root 中的 package.json 中新增 script：

     ```json
     "dev:view-react": "pnpm run -F view-react watch"
     ```

3. 修改打包路径
    在 view-react 的 vite.config.ts 中新增：
    
    ```js
    build: {
      outDir: '../extension/out/view-react'
    }
    ```
    
      将打包的目录指向 extension 的 out/view-react 目录

## 第二步：解决资源路径问题

### 实现 sidebar view 和 panel view

接下来，我们会将 view-vue 应用的页面显示在 sidebar 的区域，效果如图：

![](https://raw.githubusercontent.com/liutaigang/vscode-webview-example/main/documents/assets/vue-view-sidebar-view.png)

将 view-react 应用的视图显示在 panel 中，效果如图：

![](https://raw.githubusercontent.com/liutaigang/vscode-webview-example/main/documents/assets/react-view-panel-view.png)

具体的代码实现为：

1. 新增 contributes

   在 extension 目录的 package.json 中新增 contributes：

   ```json
     "contributes": {
       "commands": [
         {
           "command": "panel-view-container.show",
           "title": "Panel View",
           "category": "vscode-webview-example"
         }
       ],
       "viewsContainers": {
         "activitybar": [
           {
             "id": "sidebar-view",
             "title": "sidebar view example",
             "icon": "assets/icon01.svg"
           }
         ]
       },
       "views": {
         "sidebar-view": [
           {
             "id": "sidebar-view-container",
             "type": "webview",
             "name": "sidebar view"
           }
         ]
       }
     }
   ```

   **主要的 contribute 为**：

   - 一个指令：`panel-view-container.show`
   - 一个 activitybar：`sidebar-view` 以及和 activitybar 关联的 sidebar view

   **注意：** 需要在 activitybar 新增一个图标按钮

2. 实现 ViewProvider

   在 extension 的 src 新增 service 目录，并新增 ViewProvider 相关源码文件

   ```
   ├── service
    	└── view-provider
        	├── view-provider-abstract.ts
        	├── view-provider-panel.ts
        	└── view-provider-sidebar.ts
   ```

   **view-provider-abstract.ts** 提供一个抽象的实现，是仿照 `vscode.WebviewViewProvider` 来定义的，其中定义了抽象方法 `resolveWebviewView` 和 实现了对前端应用（如：view-vue, view-react）的的入口文件（如：index.html）的处理。

   源码地址：https://github1s.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/service/view-provider/view-provider-abstract.ts

   核心逻辑：

   ```ts
   import * as vscode from 'vscode'
   import * as fs from 'fs'
   import * as path from 'path'
   import { modifyHtml } from 'html-modifier'
   
   export type ViewProviderOptions = {
       distDir: string 
       indexPath: string
   }
   
   export abstract class AbstractViewProvider {
     // 这个是在前端应用插入代码的标识，用于在 index.html 文件适应的位置插入内容
     static WEBVIEW_INJECT_IN_MARK = '__webview_public_path__'
   
     /**
      * 构造方法
      * @param context 该插件的上下文，在插件激活时可以获取
      * @param options 相关配置
      */
     constructor( protected context: vscode.ExtensionContext, protected options: ViewProviderOptions) {}
   
     /**
      * 用于实现 webviewView 的处理逻辑，例如：html 赋值、通讯、设置 webviewView 参数等
      * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
      */
     abstract resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel): void
   
     /**
      * 处理前端应用 index.html 文件的方法
      * @param webview vscode.Webview 类型，指向 vscode.WebviewView 的一个属性：webview
      * @returns 处理好的 index.html 文本内容
      */
     protected async getWebviewHtml(webview: vscode.Webview) {
       const { distDir, indexPath } = this.options
       // 前端应用的打包结果所在的目录，形如：https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue
       const webviewUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, distDir)).toString()
       // 需要在前端应用中插入的脚本，目的是：将上述 webviewUri 所指的目录告知前端应用，前端应用在定位资源时需要
       const injectInContent = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`
   
       const htmlPath = path.join(this.context.extensionPath, indexPath)
       // 读取 index.html 文件内容
       const htmlText = fs.readFileSync(htmlPath).toString()
       // 使用 html-modifier 库来处理读取的内容，主要的作用是：1、将 script、link 标签中的 src、href 的值，重新赋予正确的值，2、将上述 injectInContent 的内容插入读取的内容中
       return await modifyHtml(htmlText, {
         onopentag(name, attribs) {
           if (name === 'script') attribs.src = path.join(webviewUri, attribs.src)
           if (name === 'link') attribs.href = path.join(webviewUri, attribs.href)
           return { name, attribs }
         },
         oncomment(data) {
           const hasMark = data?.toString().toLowerCase().includes(AbstractViewProvider.WEBVIEW_INJECT_IN_MARK)
           return hasMark ? { data: injectInContent, clearComment: true } : { data }
         }
       })
     }
   }
   ```

   [html-modifier](https://github.com/liutaigang/html-modifier)： 用于修改、读取 html 脚本的内容，基于：htmlparser2

   处理前 index.html 内容如下：

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8">
       <base target="_top" href="/"/>
       <link rel="icon" href="/favicon.ico">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Vite App</title>
       <!-- don't remove !! __webview_public_path__ -->
       <script type="module" crossorigin src="/assets/index-04556862.js"></script>
       <link rel="stylesheet" href="/view-vue/assets/index-645ece69.css">
     </head>
     <body>
       <div id="app"></div>
     </body>
   </html>
   ```

   处理后 index.html 内容如下：

   ```html
   <html lang="en">
     <head>
       <meta charset="UTF-8">
       <base target="_top" href="/"/>
       <link rel="icon" href="/favicon.ico">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Vite App</title>
       <script>window.__webview_public_path__="https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue"</script>
       <script type="module" crossorigin src="https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vueassets/index-04556862.js"></script>
       <link rel="stylesheet" href="https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vueassets/index-645ece69.css">
     </head>
     <body>
       <div id="app"></div>
     </body>
   </html>
   ```

   *注意*：`<!-- don't remove !! __webview_public_path__ -->` 需要放在 script 标签之前

   **view-provider-panel.ts**  和  **view-provider-sidebar.ts** 都继承自 **view-provider-abstract.ts** ，需要实现 `resolveWebviewView()` 抽象方法的具体逻辑

   源码地址：

   https://github1s.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/service/view-provider/view-provider-panel.ts

   https://github1s.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/service/view-provider/view-provider-sidebar.ts

3. 在 extension.ts 中实例化

   源码地址：https://github1s.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/extension.ts

   核心逻辑：

   ```ts
   import * as vscode from 'vscode'
   import { ViewProviderSidebar } from './service/view-provider/view-provider-sidebar'
   import { ViewProviderPanel } from './service/view-provider/view-provider-panel'
   
   export function activate(context: vscode.ExtensionContext) {
     // sibebar view 实例化
     const viewProvidersidebar = new ViewProviderSidebar(context)
     // 在 views（sidebar-view-container 已在 package.json 的 contributes 中声明）中注册
     const sidebarViewDisposable = vscode.window.registerWebviewViewProvider(
       'sidebar-view-container',
       viewProvidersidebar,
       { webviewOptions: { retainContextWhenHidden: true } }
     )
   
     // 为指令 panel-view-container.show 注册“行为”
     const panelViewDisposable = vscode.commands.registerCommand('panel-view-container.show', () => {
       const panel = vscode.window.createWebviewPanel('panel-view-container', 'Panel View', vscode.ViewColumn.One, {})
       // panel view 实例化
       const viewProviderPanel = new ViewProviderPanel(context)
       viewProviderPanel.resolveWebviewView(panel)
     })
   
     // subscriptions 列表中的 disposable, 会在插件失活时被执行
     context.subscriptions.push(sidebarViewDisposable, panelViewDisposable)
   }
   
   export function deactivate() {}
   
   ```

4. 修改前端应用资源路径

   **view-vue 应用修改**：

   在 view-vue 的 src 目录中新增 hooks 目录，在 hooks 下新增文件 use-webview-public-path.ts

   ```
   .
   ├── view-vue 
       ├── src
           ├── hooks
               ├── use-webview-public-path.ts
   ```

   在 use-webview-public-path.ts 中加入以下内容：

   ```ts
   import { ref } from 'vue'
   
   export function useWebviewPublicPath(relativePath: string) {
     const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
     const joinPath = join(webviewPublicPath, relativePath)
     return ref(path)
   }
   
   function join(...paths: string[]) {
     const joinPath = paths
       .map((path) => path.split('/'))
       .flat()
       .filter((item) => item != '' && item != '.')
       .join('/')
   
     const isRelative = paths[0].startsWith('.') || paths[0].startsWith('/')
     return isRelative ? './' + joinPath : joinPath
   }
   
   ```

   在需要资源定位的地方使用时，如(view-vue/src/App.vue)：

   ```vue
   <script setup lang="ts">
   import { RouterLink, RouterView } from 'vue-router'
   import HelloWorld from '@/components/HelloWorld.vue'
   import logPath from '@/assets/logo.svg'
   import { useWebviewPublicPath } from '@/hooks/use-webview-public-path'
   
   const logoUrl = useWebviewPublicPath(logPath)
   </script>
   
   <template>
     <header>
       <img alt="Vue logo" class="logo" :src="logoUrl" width="125" height="125" />
       <div class="wrapper">
         <HelloWorld msg="You did it!" />
         <nav>
           <RouterLink to="/">Home</RouterLink>
           <RouterLink to="/about">About</RouterLink>
         </nav>
       </div>
     </header>
     <RouterView />
   </template>
   ```

   **view-react 应用修改**：

   在 view-react 的 src 目录中新增 hooks 目录，在 hooks 下新增文件 use-webview-public-path.ts

   ```
   .
   ├── view-react 
       ├── src
           ├── hooks
               ├── use-webview-public-path.ts
   ```

   在 use-webview-public-path.ts 中加入以下内容：

   ```ts
   import { useState } from 'react'
   
   export function useWebviewPublicPath(relativePath: string) {
     const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
     const path = joinPath(webviewPublicPath, relativePath)
     return useState(path)
   }
   
   function joinPath(...paths: string[]) {
     const joinPath = paths
       .map((path) => path.split('/'))
       .flat()
       .filter((item) => item != '' && item != '.')
       .join('/')
   
     const isRelative = paths[0].startsWith('.') || paths[0].startsWith('/')
     return isRelative ? './' + joinPath : joinPath
   }
   ```

   在需要资源定位的地方使用时，如（view-react/src/App.tsx）：

   ```tsx
   import { useState } from 'react'
   import { useWebviewPublicPath } from './hooks/use-webview-public-path'
   import reactLogo from './assets/react.svg'
   import viteLogo from '/vite.svg'
   import './App.css'
   
   function App() {
     const [count, setCount] = useState(0)
     const [reactLogoPath] = useWebviewPublicPath(reactLogo)
     const [viteLogoPath] = useWebviewPublicPath(viteLogo)
   
     return (
       <>
         <div>
           <a href="https://vitejs.dev" target="_blank">
             <img src={viteLogoPath} className="logo" alt="Vite logo" />
           </a>
           <a href="https://react.dev" target="_blank">
             <img src={reactLogoPath} className="logo react" alt="React logo" />
           </a>
         </div>
         <h1>Vite + React</h1>
         <div className="card">
           <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
         </div>
         <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
       </>
     )
   }
   
   export default App
   ```

### 验证

在 root 目录下运行脚本：

```bash
pnpm dev
```

脚本执行完成后，通过 F5 开启调试，开启后，尝试以下两个方式：

- 点击 activitybar 上的图标
- 键入 `ctrl+shift+p` 在指令输入框中输入：`panel-view-container.show` 

>过程出现任何问题，欢迎提 issues

## 第二步：通讯实现

## 第三步：完善 extension 架构
