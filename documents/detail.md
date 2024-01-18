# 写在前面的

【vscode 的 webview 开发约束】

- webview 应用运行在 iframe 沙盒模式中，有诸多的约束，如：同源策略
- 资源路径需要动态的计算: webview 应用的资源路径由 vscode 给定
- 惰性加载几乎不可用：vue 和 react 惰性加载一般不建议使用，不然会比较麻烦

> 这些问题在下文中都会一一涉及，并会给出相关的解决方案

# 项目构建
项目采用 monorepo 的范式，使用 pnpm 作为包管理器

项目中主要的目录结构：

```
.
├── package.json
├── packages
│   ├── extension // extension 端的应用
│   │	└── src
│   │       ├── controller
│   │       ├── service
│   │       ├── view-provider
│   │       └── extension.ts
│   ├── view-react // webview 端的 react 应用
│   │	└── src
│   │	    ├── hooks
│   │	    └── App.tsx
│   └── view-vue // webview 端的 vue 应用
│    	└── src
│    	    ├── hooks
│    	    └── App.vue
├── pnpm-workspace.yaml
└── README.md
```

下面，我们将一步步的开始创建项目。

## 创建项目工作空间
1. 首先需要安装 pnpm，然后 init 一个项目：

   ```bash
   npm install pnpm -g
   pnpm init
   ```

2. 在 root 目录新建 pnpm-workspace.yaml，写入以下内容：

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
## 新建 extension  端应用
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

     对应将的 extension 目录中的 tsconfig.json 的 compilerOptions.outDir 设置为：
     
     ```json
     {
         "compilerOptions": {
              "outDir": "out/extension",
         }
     }
     ```

     将 .vscode 目录中的 tasks.json 的内容做如下的修改：

     ```json
     {
     	"version": "2.0.0",
     	"tasks": [
     		{
     			"type": "npm",
     			"script": "dev:extension",
     			"problemMatcher": "$tsc-watch",
     			"isBackground": true,
     			"presentation": {
     				"reveal": "never"
     			},
     			"group": {
     				"kind": "build",
     				"isDefault": true
     			}
     		}
     	]
     }
     ```

4. 新增 watch 脚本
    在 extension 中的 package.json 中新增 script：

    ```json
    "scripts": {
        "watch": "tsc -watch -p ./"
    }
    ```

      （一般是有的，不用新增）

      在 root 目录中的 package.json 中新增 script：

    ```json
    "scripts": {
        "dev": "run-p dev:view-*",
        "dev:extension": "pnpm run -F extension watch"
    }
    ```

    > 这里，run-p 使用的是 npm-run-all 的命令，需要使用 `pnpn i npm-run-all -w` 下载，`run-p dev:view-*` 可以并行的调用 `dev:view-` 开头的脚本

    > pnpm -F(--filter) 用于指定 pnpm 要使用的 package, -F(--filter) 后的为包名

## 新建 webview 端应用

### Vue 框架

1. 创建应用 view-vue
    在 packages 目录下，执行：
    
    ```
    pnpm create vue@latest
    ```
    
     *注意 Project name 要命名为： view-vue*

2. 新增 watch 脚本
    在 view-vue 中的 package.json 中新增 script：
    
    ```json
    "scripts": {
     	"watch-only": "vite build --watch",
    	"watch": "run-p type-check \"watch-only {@}\" --"
    }
    ```
    
    （这里是仿照 build 脚本的范式）
    
    在 root 目录中的 package.json 中新增 script：
    
    ```json
    "scripts": {
    	"dev:view-vue": "pnpm run -F view-vue watch"
    }
    ```
    
3. 修改打包路径
     在 view-vue 的 vite.config.ts 中新增：

     ```js
     build: {
       outDir: '../extension/out/view-vue'
     }
     ```

     将打包的目录指向 extension 的 out/view-vue 目录

### React 框架

1. 创建应用 view-react
    在 packages 目录下，执行：
    
    ```bash
    pnpm create vite view-react --template react-swc-ts
    ```
    
    （开发者可以选用自己喜欢的打包工具和 template）

2. 新增 watch 脚本
     在 view-react 中的 package.json 中新增 script：

     ```json
     "scripts": {
         "watch": "vite build --watch"
     }
     ```

     在 root 中的 package.json 中新增 script：
     
     ```json
     "scripts": {
         "dev:view-react": "pnpm run -F view-react watch"
     }
     ```
     
3. 修改打包路径
    在 view-react 的 vite.config.ts 中新增：
    
    ```js
    build: {
      outDir: '../extension/out/view-react'
    }
    ```
    
    将打包的目录指向 extension 的 out/view-react 目录

# 解决资源路径问题

## 实现 sidebar view 和 panel view

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

   **主要的 contributes 为**：

   - 一个指令：`panel-view-container.show`
   - 一个 activitybar：`sidebar-view` 以及和 activitybar 关联的 sidebar view

   **注意：** 需要在 activitybar 中的 icon 使用主要自己指定一个合理的

2. 实现 ViewProvider

   在 extension 的 src 新增 service 目录，并新增 ViewProvider 相关源码文件

   ```
   extension
       └── src
           └── view-provider
               ├── view-provider-abstract.ts
               ├── view-provider-panel.ts
               └── view-provider-sidebar.ts
   ```

   **[view-provider-abstract.ts](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-abstract.ts)** 提供一个抽象的实现，是仿照 `vscode.WebviewViewProvider` 来定义的，其中定义了抽象方法 `resolveWebviewView` 和 实现了对前端应用（如：view-vue, view-react）的的入口文件（如：index.html）的处理。

   核心逻辑：

   ```ts
   import { ExtensionContext, Uri, Webview, WebviewPanel, WebviewView } from 'vscode'
   import { readFileSync } from 'fs'
   import { join } from 'path'
   import { modifyHtml } from 'html-modifier' // 用于修改 html 内容的库，基于：htmlparser2。下载：pnpm i -F extension html-modifier
   
   export abstract class AbstractViewProvider {
     // 这个是在前端应用插入代码的标识，用于在 index.html 文件适应的位置插入内容
     static WEBVIEW_INJECT_IN_MARK = '__webview_public_path__'
   
     /**
      * 构造方法
      * @param context 该插件的上下文，在插件激活时可以获取
      */
     constructor(protected context: ExtensionContext) {}
   
     /**
      * 用于实现 webviewView 的处理逻辑，例如：html 赋值、通讯、设置 webviewView 参数等
      * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
      */
     abstract resolveWebviewView(webviewView: WebviewView | WebviewPanel): void
   
     /**
      * 处理前端应用 index.html 文件的方法
      * @param webview vscode.Webview 类型，指向 vscode.WebviewView 的一个属性：webview
      * @returns 处理好的 index.html 文本内容
      */
     protected async getWebviewHtml(webview: Webview) {
       const { distDir, indexPath } = ...
       // 前端应用的打包结果所在的目录，形如：https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue
       const webviewUri = webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, distDir)).toString()
       // 需要在前端应用中插入的脚本，目的是：将上述 webviewUri 所指的目录告知前端应用，前端应用在定位资源时需要
       const injectInContent = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`
   
       const htmlPath = join(this.context.extensionPath, indexPath)
       // 读取 index.html 文件内容
       const htmlText = readFileSync(htmlPath).toString()
       // 使用 html-modifier 库来处理读取的内容，主要的作用是：1、将 script、link 标签中的 src、href 的值，重新赋予正确的值，2、将上述 injectInContent 的内容插入读取的内容中
       return await modifyHtml(htmlText, {
         onopentag(name, attribs) {
           if (name === 'script') attribs.src = join(webviewUri, attribs.src)
           if (name === 'link') attribs.href = join(webviewUri, attribs.href)
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

   处理前 index.html 内容形如：

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

   处理后 index.html 内容形如：

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

   [**view-provider-panel.ts**](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-panel.ts)  和  **[view-provider-sidebar.ts](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-sidebar.ts)** 都继承自 **view-provider-abstract.ts** ，需要实现 `resolveWebviewView()` 抽象方法的具体逻辑

   源码地址：

   [https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-panel.ts](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-panel.ts)

   [https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-sidebar.ts](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/view-provider/view-provider-sidebar.ts)

3. 在 [extension.ts](https://github.com/liutaigang/vscode-webview-example/blob/main/packages/extension/src/extension.ts) 中实例化

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

   在 [use-webview-public-path.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/hooks/use-webview-public-path.ts) 中加入以下内容：

   ```ts
   import { ref } from 'vue'
   import { join } from 'path-browserify' // 下载：pnpm i -w path-browserify
   
   const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
   export function useWebviewPublicPath(relativePath: string): Ref<string> {
     const path = join(webviewPublicPath, relativePath)
     return ref(path)
   }
   ```
   
   在需要资源定位的地方使用时，如([view-vue/src/App.vue](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/App.vue))：
   
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
   
   在 [use-webview-public-path.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-react/src/hooks/use-webview-public-path.ts) 中加入以下内容：
   
   ```ts
   import { useState } from 'react'
   import { join } from 'path-browserify' // 下载：pnpm i -w path-browserify
   
   const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
   export function useWebviewPublicPath(relativePath: string) {
     const path = joinPath(webviewPublicPath, relativePath)
     return useState(path)
   }
   ```

   在需要资源定位的地方使用时，如（[view-react/src/App.tsx](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-react/src/App.tsx)）：
   
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

## 验证

在 root 目录下运行脚本：

```bash
pnpm dev
```

脚本执行完成后，通过 F5 开启调试，开启后，尝试以下两个方式：

- 点击 activitybar 上的图标：![](https://raw.githubusercontent.com/liutaigang/vscode-webview-extension-example/main/documents/assets/activitybar-icon.png)
- 键入 `ctrl+shift+p` 在指令输入框中输入：`panel-view-container.show` 

>过程出现任何问题，欢迎提 issue

# 通信实现

## 使用的通信框架库 cec-client-server

这里的通讯主要指的是 extension 端和 webview 端的通信。

本项目中，我们不是直接使用 [vscode webview 提供的通讯 API](https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing) 进行两端的信息交换，而是使用 [cec-client-server](https://github.com/liutaigang/cross-end-call) ，这个库主要的作用是：可以将端与端之间`消息的发送和接收`，转换为`方法调用`和`主题订阅`。这样说得有点抽象，以`方法调用`为例，我们来一个伪代码的演示：

有这样一个需求：

- webview 端向 extension 端请求 vscode 的主题色
- extension 端调用 api 获取后，返回给 webview 端，失败则返回失败信息

**传统的方式：**

```js
// webview 端
const vscodeApi = window.acquireVsCodeApi()
vscodeApi.postMessage('getTheme')
window.addEventListener("message", ({ data }) => {
  if(data.type === 'returnTheme') {
  	if (data.state === 'success') {
	  console.log(data.value)
  	} else {
  	  console.log(data.error)
  	}
  }
})

// extension 端
webview.onDidReceiveMessage((method) => {
  if(method === "getTheme") {
     ...
     try {
       cosnt theme = getTheme()
       webview.postMessage({ type: 'returnTheme', value: theme, state: 'success' })
     } catch(error) {
       webview.postMessage({ type: 'returnTheme', error, state: 'failed' })
     }
  }
})
```

**使用 cec-client-server ：**

```js
// extension 端
import { CecServer } from "cec-client-server";
const cecServer = new CecServer(webview.postMessage, webview.onDidReceiveMessage);
cecServer.onCall('getTheme', () => {
  ...
  return getTheme();
})

// webview 端
import { CecClient } from "cec-client-server";
const vscodeApi = window.acquireVsCodeApi();
const cecClient = new CecClient(vscodeApi.postMessage, window.addEventListener);
cecClient.call('getTheme')
  .then((theme) => console.log(theme))
  .catch((error) => console.log(theme));  
```

使用的 cec-client-server 之后，整个信息交换的过程变得清晰了很多。

**更重要的意义在于：信息的交换的主导方，从 webview 端变成了 extension 端**，如上例，在传统的方式中，信息的类型需要 webview 端告知 extension 端，信息如何处理，需要双方的约定；使用 cec-client-server；extension 端只需要定义一个可以调用的"方法"，webview 端需要调用，按照定义好的方式即可，不需要和 extension 端做任何约定。这样方式大大减少了两端的耦合。

cec-client-server 还能实现主题的订阅，即：extension 端可以实现一个主题（subject），webview 端实现一个对应的观察者（observer ），处理主题的状态变化，熟悉 rxjs 的话应该会很容易上手。cec-client-server 地址：https://github.com/liutaigang/cross-end-call

## Extension 端应用的通信实现

首先，我们需要明确一下 cec-client-server 的几个概念：

- callable —— 指可以被调用的方法
- subscribable —— 指可以被订阅的主题
- controller —— callable 和 subscribable 的统称
- service —— 可以理解为 controller 的 “服务者”

我们还需要用到 cec-client-server 的**装饰器模块**， 即：cec-client-server/decorator。下面，我们定义一个 controller ： 

在 extension/src 中新增 controller 目录，在 controller 下新增如下：

```
.
├── extension 
    ├── src
        ├── controller
            ├── controller-registry
            │	└── index.ts
            ├── vsc-theme.controller.ts
```

**[vsc-theme.controller.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/extension/src/controller/vsc-theme.controller.ts)** 中定义一个 定义用于 vscode 的主题色获取和修改的 callable 和 subscribable：

```TS
import { workspace } from 'vscode'
import { controller, callable, subscribable } from 'cec-client-server/decorator'

/**
 * @controller('VscTheme') 装饰器的作用有：
 * - 自动实例化 VscThemeControler 类，在使用的地方以单例的方式提供。在代码中一般不直接实例化 controller！
 * - 将 VscThemeControler 类的实例化dui'xi'g 注册一个名为 'VscTheme' 的 controller
 *
 * controller 的命名规则：
 * - 别名（alias）：如 @controller('VscTheme') 的就是使用别名 'VscTheme' 来注册 controller
 * - 使用类名：如 @controller() 的就是使用类名 VscThemeController 来注册 controller。
 *	 因为 controller 的类名一般都以 Controller 作为后缀，为了命名简单，一般都使用别名
 */
@controller('VscTheme')
export class VscThemeControler {
  constructor() {}

  /**
   * @callable('getTheme') 装饰器的作用有：
   * - 将方法 getThemeForCall 以别名 getTheme 注册为一个 callable
   * - 最终这个可调用方法的名称为：VscTheme.getTheme，规则为：[controllerName].[callableName]
   *
   * callable 的命名规则：
   * - 有别名的话，使用别名，没有别名，使用方法名来注册 callable。所以不能使用 Symbol 来声明方法！
   * - callable 和 subscribable 可以重名，但是和 callable 和 callable 禁止重名！
   */
  @callable('getTheme') // 这里使用了别名
  async getThemeForCall() {
    const colorTheme = workspace.getConfiguration().get('workbench.colorTheme')
    return colorTheme
  }

  /**
   * @subscribable('getTheme') 装饰器的作用有：
   * - 将“主题” getThemeForSubscribe 以别名 getTheme 注册为一个 subscribable
   * - 最终这个订阅这个“主题”的名称为：VscTheme.getTheme
   *
   * subscribable 的命名规则：和 callable 的相同
   */
  @subscribable('getTheme')
  getThemeForSubscribe(next: (value: any) => void) {
    const disposable = workspace.onDidChangeConfiguration(() => {
      const colorTheme = workspace.getConfiguration().get('workbench.colorTheme')
      next(colorTheme)
    })
    return disposable.dispose.bind(disposable)
  }

  @callable() // 不使用别名时，callable 的名称就是方法名：updateTheme 本身，所以最终这个可调用方法的名称为：VscTheme.updateTheme
  updateTheme(colorTheme: string) {
    workspace.getConfiguration().update('workbench.colorTheme', colorTheme)
  }
}
```

在 **[controller-registry/index.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/extension/src/controller/contoller-registry/index.ts)** 中将定义好的 controller 进行注册：

```TS
import { registerControllers } from 'cec-client-server/decorator'
import { VscThemeControler } from '../vsc-theme.controller'

registerControllers([VscThemeControler])
```

最后，需要在 extension.ts 中导出执行，并在实例化 view-provider 时使用：

```ts
import 'reflect-metadata'
import './controller/contoller-registry'; // 直接执行
import { ExtensionContext, window } from 'vscode'
import { ViewProviderSidebar } from './view-provider/view-provider-sidebar'
import { getControllers } from 'cec-client-server/decorator'; // 导出 getControllers 方法

export function activate(context: ExtensionContext) {
  const { callables, subscribables } = getControllers() // getControllers 能获取使用 @controller, @callable, @subscribable 装饰的所有能力和主题
  const viewProvidersidebar = new ViewProviderSidebar(context, { callables, subscribables })
  const sidebarViewDisposable = window.registerWebviewViewProvider(
    'sidebar-view-container',
    viewProvidersidebar,
  )
  context.subscriptions.push(sidebarViewDisposable)
}

export function deactivate() {}
```

相应的，需要在 [view-provider](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/extension/src/view-provider/view-provider-abstract.ts) 中实现通讯相关逻辑，核心代码：

```ts
import { CecServer } from 'cec-client-server'
/**
  * 新增一个 CecServer 实例，并设置相关的 callable 和 subscribable
 * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
 */
protected setControllers(webview: Webview) {
  // 实例化 CecServer
  const cecServer = new CecServer(
    webview.postMessage.bind(webview),
    webview.onDidReceiveMessage.bind(webview)
  )
  
  // 注册：callable, subscribable
  const { callables, subscribables } = this.controllerOptions
  Object.entries(callables).map((item) => cecServer.onCall(...item))
  Object.entries(subscribables).map((item) => cecServer.onSubscribe(...item))
}
```

**注意：**

因为 cec-client-server/decorator 使用了 [tsyringe](https://github.com/microsoft/tsyringe) ，所以需要在 tsconfig.json 中设置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

还需要增加一个 Reflect API 的 polyfill，可选的有：

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

以 reflect-metadata 为例，下载： 

```
pnpm i -F extension reflect-metadata
```

最后在 extension.ts 中导入：

```ts
// extension.ts
import "reflect-metadata"; // 在所有代码之前

// Your code here...
```

## Webview  端通讯实现：以 Vue 为例

承接 extension 端应用的通信实现例子，我们在 Vue 应用中实现对应的逻辑。

在 view-vue 中的 src/hooks 目录中新增以下文件：

```
.
├── view-vue 
    ├── src
        ├── hooks
            ├── use-cec-client.ts
            ├── use-vsc-color-theme.ts
```

**[use-cec-client.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/hooks/use-cec-client.ts)** 是与 extensoin 端建立连接的一个 hook，其逻辑为：

```ts
import { CecClient, type MsgObserver } from 'cec-client-server'

// acquireVsCodeApi 是 extension 的 webview 在 iframe 中注入的一个方法，用于像 webview 发送信息等
const vscodeApi = (window as any).acquireVsCodeApi()

// 实例化 CecClient
const msgSender: MsgSender = vscodeApi.postMessage.bind(vscodeApi)
const msgReceiver: MsgReceiver = (msgHandler) => {
  window.addEventListener('message', (evt) => msgHandler(evt.data))
}
const cecClient = new CecClient(msgSender, msgReceiver)

//  暴露 CecClient 实例的 call 方法
export const useCall = <ReplyVal>(name: string, ...args: any[]) => {
  return cecClient.call<ReplyVal>(name, ...args)
}

//  暴露 CecClient 实例的 subscrible 方法
export const useSubscrible = (name: string, observer: MsgObserver, ...args: any[]) => {
  return cecClient.subscrible(name, observer, ...args)
}
```

**[use-vsc-color-theme.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/hooks/use-vsc-color-theme.ts)** 是进行主题的修改和订阅的一个 hook，其逻辑为：

```ts
import { ref, onUnmounted } from 'vue'
import { useCall, useSubscrible } from './use-cec-client'

export const vscColorThemeOptions = [
  {
    label: 'Light (Visual Studio)',
    value: 'Visual Studio Light'
  },
  {
    label: 'Dark (Visual Studio)',
    value: 'Visual Studio Dark'
  },
  ...
]

export function useVscColorTheme() {
  const colorTheme = ref<string>()
  
  // 确保能立即获取到当前的主题色
  useCall<string>('VscTheme.getTheme').then((theme) => {
    colorTheme.value = theme
  })
  
  // 订阅主题色变化
  const dispose = useSubscrible('VscTheme.getTheme', (theme: string) => {
    colorTheme.value = theme
  })
  onUnmounted(dispose)

  // 更新主题色
  const setColorTheme = (colorTheme: string) => {
    useCall('VscTheme.updateTheme', colorTheme)
  }

  // 暴露当前主题色的 ref 变量，和更新的方法
  return { colorTheme, setColorTheme }
}
```

最后，我们就可以在视图组件中使用了，如（[src/App.vue](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/App.vue)）：

```vue
<script setup lang="ts">
import { useVscColorTheme, vscColorThemeOptions } from '@/hooks/use-vsc-color-theme'

// Vscode 主题监听和设置示例
const { colorTheme, setColorTheme } = useVscColorTheme()
const onColortThemeInput = () => {
  setTimeout(() => setColorTheme(colorTheme.value!))
}
</script>

<template>
  <header>
    <div class="example-block">
      <h2>主题获取、监听和设置演示</h2>
      <label for="color-theme-select">请选择 Vscode 的主题:</label>
      <select id="color-theme-select" v-model="colorTheme" @input="onColortThemeInput()">
        <option v-for="{ value, label } of vscColorThemeOptions" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
      <div>当前窗口 vscode 的主题类型: {{ colorTheme }}</div>
    </div>
  </header>
  <RouterView />
</template>
```

## 其他示例：后端接口请求

**因为 vscode 的 webview 实质上是一个 iframe，其 src 的指向的是本地资源，且使用了 sandbox 的 allow-same-origin 属性，这意味着 webview 端的应用中发起的接口请求可能会受到“同源策略”的限制**，如图：

<img src="https://raw.githubusercontent.com/liutaigang/vscode-webview-extension-example/main/documents/assets/iframe-crosss-domain.png" />

所以，我们一般在 extension 端发起接口请求，然后通过通信来传递请求数据给 webview 端。下面，通过一个示例来具体看看。

在 extension 端应用中，**新建 Axios 的服务（service）、控制器（controller）**：

```
.
├── extension 
    ├── src
        ├── controller
        │   ├── aixos.controller.ts
        ...
        ├── service
          	├── axios.service.ts
```

**[axios.service.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/extension/src/service/axios.service.ts)**： 该服务的作用是实现 axios 请求的所有逻辑，包括但不限于：参数配置、数据处理、拦截器等。

```ts
import { service } from 'cec-client-server/decorator'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios'

/**
 * @service() 装饰器会实例化 AxiosService 类，并将它保存在一个容器中，在需要的地方以单例的方式提供
 */
@service()
export class AxiosService implements Pick<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  private axiosInstance: AxiosInstance
  private createAxiosDefaults: CreateAxiosDefaults = {}
  private requestInterceptor = {
    onFulfilled: (config: InternalAxiosRequestConfig) => { return config },
    onRejected: (error: any) => { return Promise.reject(error) }
  }
  private responseInterceptor = {
    onFulfilled: (config: AxiosResponse) => { return config },
    onRejected: (error: any) => { return Promise.reject(error) }
  }

  constructor() {
    this.axiosInstance = axios.create(this.createAxiosDefaults)
    const { onFulfilled, onRejected } = this.requestInterceptor
    this.axiosInstance.interceptors.request.use(onFulfilled, onRejected)
    const { onFulfilled: onFulfilled01, onRejected: onRejected01 } = this.responseInterceptor
    this.axiosInstance.interceptors.response.use(onFulfilled01, onRejected01)
  }

  get<T = any, R = AxiosResponse<T, any>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.axiosInstance.get(url, config)
  }

  post<T = any, R = AxiosResponse<T, any>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }

  put<T = any, R = AxiosResponse<T, any>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }

  delete<T = any, R = AxiosResponse<T, any>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.axiosInstance.post(url, config)
  }

  patch<T = any, R = AxiosResponse<T, any>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.axiosInstance.post(url, data, config)
  }
}
```

该服务使用了 `cec-client-server/decorator` 的 `service` 装饰器，该装饰器的作用是将被装饰的类，以单例的形式供 controller 使用。

**[axios.controller.ts](https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/extension/src/controller/axios.controller.ts)**： 使用了 AxiosService 服务，主要作用是暴露 AxiosService 的能力：

```ts
import { AxiosRequestConfig } from 'axios'
import { callable, controller } from 'cec-client-server/decorator'
import { AxiosService } from '../service/axios.service'

@controller('Axios')
export class AxiosControler {
  // AxiosService 不需要实例化，因为其使用 @service, cec-client-server/decorator 模块会自动实例化，并赋值给 axiosService 属性
  constructor(private axiosService: AxiosService) {}

  @callable()
  get(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.get(url, config)
  }

  @callable()
  post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.post(url, data, config)
  }

  @callable()
  put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.put(url, data, config)
  }

  @callable()
  delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosService.delete(url, config)
  }
}
```

最后，在 webview 端的 Vue 应用中使用的示例源码：

https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/hooks/use-axios.ts

https://github.com/liutaigang/vscode-webview-extension-example/blob/main/packages/view-vue/src/App.vue

# 架构原理

## 整体架构

整个示例中，我们共有三个模块：extension 一个， webview 有两个，分别为 view-vue, view-react。如图：

![](https://raw.githubusercontent.com/liutaigang/vscode-webview-extension-example/main/documents/assets/jiagou.png)


这里，我们整体采用的是 server-client 的架构， extension 端可以类比于 server ，webview 端可以类比于 client。

extension 端和 webview 端需要保持单向的依赖关系，即 **webview 端的依赖可以指向 extension 端，反之则不行**。这也是我们使用 cec-client-server 的原因。我们认为 extension 端是高于 webview 端的，类比于架构设计，低级模块依赖于高级模块，反之则不行。

<img src="https://raw.githubusercontent.com/liutaigang/vscode-webview-extension-example/main/documents/assets/dependency.png" style="zoom:75%;" />

> 什么是依赖？
>
> - 一段代码中，直接体现是：在 A 的代码中，使用了 B 的代码，则 A 依赖于 B，不管有没有显示的声明。
> - 一个应用中，直接体现是：在 A 组件使用 B 组件（B 服务，B 方法， B 库），则 A 依赖于 B，不管有没有显示的声明。
> - 一个系统中，直接体现是：在 A 服务调用 B 服务的接口，则 A 依赖于 B。如：前端应用调用了后端的接口，后端调用了中台的接口。
>
> 更广义的，我们可以将依赖做这样的定义：**当 A 的完整性，需要 B 的支持，则 A 依赖于 B**

extension 端应用可能需要面对多个 webview 端应用，所以 extension 端应用不能向 webview 端应用索要任何能力，这样做会导致 extension 端应用的代码逻辑业务化，会引入更多的逻辑判断和差异兼容。

但是，在实际的业务中，高阶模块依赖低阶模块是常见，事实上，在设计模式中，我们常使用“依赖倒置”来解决。

在我们示例中，cec-client-server 就是我们用于实现依赖倒置的工具。

## extension 端应用架构

extension 端应用架构同样要注意模块之间的依赖关系，因为有 cec-client-server/decorator 库的支持，所以整体比较的简单。但是仍要强调是的是：

**controller 层**   —依赖—>   **service 层 **  —依赖—>   **vscode 能力 + 其他能力**

这样的依赖方向不能反过来。

> cec-client-server/decorator 库的核心使用了“依赖注入”的设计模式，使用“服务”时，不需要关心它如何实例化。
