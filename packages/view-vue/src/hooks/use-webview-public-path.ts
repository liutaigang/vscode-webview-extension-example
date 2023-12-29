import { ref, type Ref } from 'vue'
import { join } from 'path-browserify'

export function useWebviewPublicPath(relativePath: string): Ref<string> {
  const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
  const path = join(webviewPublicPath, relativePath)
  return ref(path)
}
