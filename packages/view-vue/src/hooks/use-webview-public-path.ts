import { ref, type Ref } from 'vue'
import { join } from 'path-browserify'

const webviewPublicPath = ((window as any).__webview_public_path__ as string) ?? ''
export function useWebviewPublicPath(relativePath: string): Ref<string> {
  const path = join(webviewPublicPath, relativePath)
  return ref(path)
}
