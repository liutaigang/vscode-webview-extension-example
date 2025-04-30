import { ExtensionContext, Uri, Webview, WebviewPanel, WebviewView } from 'vscode';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as htmlParser } from 'node-html-parser';
import { HandlerConfig, JsonrpcServer, expose } from '@jsonrpc-rx/server';

export type ViewProviderOptions = {
  distDir: string;
  indexPath: string;
};

export abstract class AbstractViewProvider {
  // 在 index.html 中注入 WebviewUri 的全局变量名
  static WEBVIEW_INJECT_IN_MARK = '__webview_uri__';
  // 用于判断是否使用 vite 插件的一个标识
  static VSCODE_WEBVIEW_HMR_MARK = 'vite-plugin-vscode-webview-hmr';

  /**
   * 构造方法
   * @param context 该插件的上下文，在插件激活时可以获取
   * @param handlers jsonrpc-rx 中的处理逻辑的配置
   * @param wiewProviderOptions 相关配置
   */
  constructor(
    protected context: ExtensionContext,
    protected handlers: HandlerConfig,
    protected wiewProviderOptions: ViewProviderOptions
  ) {}

  /**
   * 用于实现 webviewView 的处理逻辑，例如：html 赋值、通讯、设置 webviewView 参数等
   * @param webviewView 可以为 vscode.WebviewView 或者 vscode.WebviewPanel 的实例
   */
  abstract resolveWebviewView(webviewView: WebviewView | WebviewPanel): void;

  /**
   * “暴露” handles 给 WebView。建立 extenson 和 webview 之间的通讯
   * @param webview WebView
   */
  protected exposeHandlers(webview: Webview) {
    const jsonrpcServer = new JsonrpcServer(webview.postMessage.bind(webview), webview.onDidReceiveMessage.bind(webview));
    expose(jsonrpcServer, this.handlers);
  }

  /**
   * 处理前端应用 index.html 文件的方法
   * @param webview vscode.Webview 类型，指向 vscode.WebviewView 的一个属性：webview
   * @returns 处理好的 index.html 文本内容
   */
  protected async getWebviewHtml(webview: Webview) {
    const { distDir, indexPath } = this.wiewProviderOptions;
    const { extensionUri, extensionPath } = this.context;

    // 前端应用的打包结果所在的目录，形如：https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue
    const webviewUri = webview.asWebviewUri(Uri.joinPath(extensionUri, distDir)).toString();

    // 读取 index.html 文件内容
    const htmlText = readFileSync(join(extensionPath, indexPath), { encoding: 'utf8' }).toString();
    const root = htmlParser(htmlText);

    // 主要的作用是：在生产模式下（没有使用 vite-plugin-vscode-webview-hmr 插件）将 script、link 标签中的 src、href 的值，重新赋予正确的值
    if (!htmlText.includes(AbstractViewProvider.VSCODE_WEBVIEW_HMR_MARK)) {
      const tagToChange = [
        ['script', 'src'],
        ['link', 'href']
      ];
      for (const [tag, attr] of tagToChange) {
        const elements = root.querySelectorAll(tag);
        for (const elem of elements) {
          const attrValue = elem.getAttribute?.(attr);
          if (attrValue) {
            elem.setAttribute(attr, join(webviewUri, attrValue));
          }
        }
      }
    }

    // 需要在前端应用中插入的脚本，目的是：将上述 webviewUri 传递给前端应用，前端应用在定位资源时需要
    const injectScript = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`;
    root.querySelector('head')!.insertAdjacentHTML('afterbegin', injectScript);

    return root.toString();
  }
}
