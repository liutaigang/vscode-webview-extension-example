import { join } from 'path-browserify';

const webviewPublicPath = ((window as any).__webview_uri__ as string) ?? '';

// 将 WebviewUri 拼接与当前路径进行拼接
export function joinWebviewUri(relativePath: string) {
  return join(webviewPublicPath, relativePath);
}
